"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: string;
}

export default function ContactFormsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("https://maple-server-e7ye.onrender.com/api/contacts", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'new' | 'read' | 'responded') => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://localhost:3000/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated successfully');
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-green-100 text-green-800',
      responded: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge 
        className={`${statusStyles[status as keyof typeof statusStyles]} cursor-pointer`}
        onClick={() => {
          const nextStatus = {
            new: 'read',
            read: 'responded',
            responded: 'new'
          }[status as keyof typeof nextStatus];
          handleStatusUpdate(contact._id, nextStatus);
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
        <Badge variant="outline">
          Total: {contacts.length}
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading submissions...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No contact submissions found
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contact.phone}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate" title={contact.message}>
                        {contact.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contact.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}