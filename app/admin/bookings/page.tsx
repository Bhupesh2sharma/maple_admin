"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

// Updated interface to match our booking schema
interface Booking {
  _id: string;
  package: {
    _id: string;
    title: string;
  };
  startDate: string;
  numberOfPeople: {
    adults: number;
    children: number;
  };
  totalAmount: number;
  contactDetails: {
    phone: string;
    alternatePhone?: string;
    email: string;
  };
  specialRequirements?: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'pending';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch all bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // Assuming you store admin token
      const response = await fetch("https://maple-server-e7ye.onrender.com/api/bookings", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://maple-server-e7ye.onrender.com/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingStatus: status })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Booking status updated to ${status}`);
        fetchBookings(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.bookingStatus === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <div className="flex gap-2">
          <select
            className="border rounded-md px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => fetchBookings()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Travel Date</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Booking Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking._id.slice(-6)}</TableCell>
                  <TableCell>{booking.package.title}</TableCell>
                  <TableCell>{new Date(booking.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {booking.numberOfPeople.adults} Adults
                    {booking.numberOfPeople.children > 0 && `, ${booking.numberOfPeople.children} Children`}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{booking.contactDetails.email}</div>
                      <div className="text-sm text-gray-500">{booking.contactDetails.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>₹{booking.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(booking.bookingStatus)}</TableCell>
                  <TableCell>{getStatusBadge(booking.paymentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.bookingStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          // Add view details functionality
                        }}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
