"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ✅ Define the expected structure of a booking
interface Booking {
  _id: string;
  package: string;
  travelDate: string;
  adults: number;
  children: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch all bookings
  useEffect(() => {
    fetch("https://maplesserver.vercel.app/api/booking")
      .then((res) => res.json())
      .then((response) => {
        console.log("Fetched data:", response);
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          console.error("Unexpected API Response Format:", response);
          setBookings([]);
        }
      })
      .catch((err) => console.error("Error fetching bookings:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bookings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Travel Date</TableHead>
            <TableHead>Adults</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{booking._id}</TableCell>
                <TableCell>{booking.package}</TableCell>
                <TableCell>{new Date(booking.travelDate).toLocaleDateString()}</TableCell>
                <TableCell>{booking.adults}</TableCell>
                <TableCell>{booking.children}</TableCell>
                <TableCell>{booking.firstName} {booking.lastName}</TableCell>
                <TableCell>{booking.email}</TableCell>
                <TableCell>{booking.phone}</TableCell>
                <TableCell>{booking.status || "Not Confirmed"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center">No bookings found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
