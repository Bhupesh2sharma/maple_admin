"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Star, Check, X } from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  testimonial: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("https://maple-server-e7ye.onrender.com/api/testimonials", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();
      setTestimonials(data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalUpdate = async (id: string, isApproved: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://localhost:3000/api/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isApproved })
      });

      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }

      toast.success(`Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchTestimonials(); // Refresh the list
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast.error('Failed to update approval status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://localhost:3000/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }

      toast.success('Testimonial deleted successfully');
      fetchTestimonials(); // Refresh the list
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <div className="flex gap-4">
          <Badge variant="outline">
            Total: {testimonials.length}
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            Approved: {testimonials.filter(t => t.isApproved).length}
          </Badge>
          <Badge variant="outline" className="bg-yellow-50">
            Pending: {testimonials.filter(t => !t.isApproved).length}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading testimonials...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No testimonials found
                  </TableCell>
                </TableRow>
              ) : (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial._id}>
                    <TableCell className="font-medium">
                      {testimonial.name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate" title={testimonial.testimonial}>
                        {testimonial.testimonial}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {renderStars(testimonial.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(testimonial.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={testimonial.isApproved ? 
                          'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {testimonial.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!testimonial.isApproved && (
                          <Button
                            onClick={() => handleApprovalUpdate(testimonial._id, true)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {testimonial.isApproved && (
                          <Button
                            onClick={() => handleApprovalUpdate(testimonial._id, false)}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(testimonial._id)}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
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