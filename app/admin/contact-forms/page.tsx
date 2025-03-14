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

  
  };

  return (
    <div className="space-y-4 p-2 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-3xl font-bold mt-12">Contact Form Submissions</h1>
        <button
          onClick={() => fetchContacts()}
          className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading submissions...</div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="block sm:hidden">
            {contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                    {/* Contact Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</div>
                      </div>
                      <select
                        value={contact.status}
                        onChange={(e) => {
                          const status = e.target.value;
                          const nextStatus = {
                            new: 'read',
                            read: 'responded',
                            responded: 'new'
                          }[status as keyof typeof nextStatus];
                          handleStatusUpdate(contact._id, nextStatus);
                        }}
                        className="text-xs border rounded-md px-2 py-1"
                      >
                        <option value={contact.status}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </option>
                      </select>
                    </div>

                    {/* Contact Details */}
                    <div className="grid gap-2 text-sm">
                      <div className="grid grid-cols-3">
                        <div className="text-gray-600">Email:</div>
                        <div className="col-span-2 break-all">
                          <a href={`mailto:${contact.email}`} className="text-blue-600">
                            {contact.email}
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-3">
                        <div className="text-gray-600">Phone:</div>
                        <div className="col-span-2">
                          <a href={`tel:${contact.phone}`} className="text-blue-600">
                            {contact.phone}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-gray-600">Message:</div>
                        <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                          {contact.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg">
                No contact form submissions found.
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
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
                {contacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>{contact.firstName} {contact.lastName}</TableCell>
                    <TableCell>
                      <a href={`mailto:${contact.email}`} className="text-blue-600">
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${contact.phone}`} className="text-blue-600">
                        {contact.phone}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                    <TableCell>{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <select
                        value={contact.status}
                        onChange={(e) => {
                          const status = e.target.value;
                          const nextStatus = {
                            new: 'read',
                            read: 'responded',
                            responded: 'new'
                          }[status as keyof typeof nextStatus];
                          handleStatusUpdate(contact._id, nextStatus);
                        }}
                        className="border rounded-md px-2 py-1"
                      >
                        <option value={contact.status}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
                {contacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No contact form submissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}