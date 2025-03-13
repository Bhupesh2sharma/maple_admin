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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex gap-4">
          <Badge variant="outline">
            Total Users: {users.length}
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            Admins: {users.filter(user => user.role === 'admin').length}
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Regular Users: {users.filter(user => user.role === 'user').length}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {user.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`tel:${user.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
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
      )}
    </div>
  );
}