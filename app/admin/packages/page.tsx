"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ✅ Define the expected package structure
interface Package {
  _id: string;
  title: string;
  price: number;
  description: string;
  duration: string;
}

export default function BookingsPage() {
  const [packages, setPackages] = useState<Package[]>([]);

  // Fetch all packages
  useEffect(() => {
    fetch("https://maplesserver.vercel.app/api/package")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        if (Array.isArray(data)) {
          setPackages(data);
        } else if (data.data && Array.isArray(data.data)) {
          setPackages(data.data);
        } else {
          console.error("Unexpected API Response Format:", data);
          setPackages([]);
        }
      })
      .catch((err) => console.error("Error fetching packages:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Packages</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Duration(Days)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg._id}>
              <TableCell>{pkg._id}</TableCell>
              <TableCell>{pkg.title}</TableCell>
              <TableCell>{pkg.price}</TableCell>
              <TableCell>{pkg.description}</TableCell>
              <TableCell>{pkg.duration} </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
