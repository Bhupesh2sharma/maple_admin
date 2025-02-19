"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  // Fetch all bookings
  useEffect(() => {
    fetch("http://localhost:5000/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, []);

  // Handle confirm action
  const handleConfirm = async (id, currentStatus) => {
    const newStatus = currentStatus === "Confirmed" ? "Not Confirmed" : "Confirmed";

    try {
      const res = await fetch(`http://localhost:3000/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === id ? { ...booking, status: newStatus } : booking
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bookings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Adults</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Card Name</TableHead>
            <TableHead>Card Number</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>CVV</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell>{booking._id}</TableCell>
              <TableCell>{booking.package}</TableCell>
              <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
              <TableCell>{booking.adults}</TableCell>
              <TableCell>{booking.children}</TableCell>
              <TableCell>{booking.firstName} {booking.lastName}</TableCell>
              <TableCell>{booking.email}</TableCell>
              <TableCell>{booking.phone}</TableCell>
              <TableCell>{booking.cardName}</TableCell>
              <TableCell>{booking.cardNumber}</TableCell>
              <TableCell>{booking.expiryDate}</TableCell>
              <TableCell>{booking.cvv}</TableCell>
              <TableCell>{booking.status || "Not Confirmed"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfirm(booking._id, booking.status || "Not Confirmed")}
                >
                  {booking.status === "Confirmed" ? "Unconfirm" : "Confirm"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
