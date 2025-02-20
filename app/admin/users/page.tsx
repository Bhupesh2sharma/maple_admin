"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  // Fetch all users
  useEffect(() => {
    fetch("https://maplesserver.vercel.app/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.data && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error("Unexpected API Response Format:", data);
          setUsers([]);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {users.map((user, index) => (
    <TableRow key={user._id}>
      <TableCell>{index + 1}</TableCell> {/* Auto-incrementing User ID */}
      <TableCell>{user.firstName}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.phone}</TableCell>
      <TableCell>{user.role}</TableCell>
    </TableRow>
  ))}
</TableBody>

      </Table>
    </div>
  );
}
