"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("https://maple-server-e7ye.onrender.com/api/user", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.default;
  };

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <div className="space-y-4 p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-3xl font-bold mt-12">Users</h1>
        <div className="grid grid-cols-3 w-full sm:w-auto gap-2 sm:flex sm:gap-4">
          <Badge variant="outline" className="justify-center">
            Total: {users.length}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 justify-center">
            Admins: {users.filter(user => user.role === 'admin').length}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 justify-center">
            Users: {users.filter(user => user.role === 'user').length}
          </Badge>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        {users.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            No users found
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={user._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      #{index + 1} • Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge
                      className={user.isActive ? 
                        'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="grid grid-cols-3">
                    <div className="text-gray-600">Email:</div>
                    <div className="col-span-2">
                      <a href={`mailto:${user.email}`} className="text-blue-600 break-all">
                        {user.email}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-3">
                    <div className="text-gray-600">Phone:</div>
                    <div className="col-span-2">
                      <a href={`tel:${user.phone}`} className="text-blue-600">
                        {user.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800">
                      {user.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a href={`tel:${user.phone}`} className="text-blue-600 hover:text-blue-800">
                      {user.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={user.isActive ? 
                        'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}