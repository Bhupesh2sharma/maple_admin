"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    price: { amount: 0, currency: "₹" },
    duration: { days: 0, nights: 0 },
    itinerary: [{ day: 1, title: "", description: "" }],
    inclusions: [""],
    exclusions: [""],
    cancellationPolicy: "",
  });

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/packages");
      const data = await response.json();
      setPackages(data.data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Create new package
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    
    try {
      const formDataToSend = new FormData();
      
      // Add package data
      formDataToSend.append("packageData", JSON.stringify(formData));

      // Add images
      const imageInput = document.querySelector('input[name="images"]');
      if (imageInput?.files) {
        Array.from(imageInput.files).forEach(file => {
          formDataToSend.append("images", file);
        });
      }

      // Add PDF
      const pdfInput = document.querySelector('input[name="pdfBrochure"]');
      if (pdfInput?.files?.[0]) {
        formDataToSend.append("pdfBrochure", pdfInput.files[0]);
      }

      const url = selectedPackage 
        ? `http://localhost:3000/api/packages/${selectedPackage._id}`
        : "http://localhost:3000/api/packages";

      const response = await fetch(url, {
        method: selectedPackage ? "PUT" : "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save package');
      }

      toast.success(selectedPackage ? "Package updated successfully" : "Package created successfully");
      setShowForm(false);
      setSelectedPackage(null);
      setFormData({
        title: "",
        description: "",
        destination: "",
        price: { amount: 0, currency: "₹" },
        duration: { days: 0, nights: 0 },
        itinerary: [{ day: 1, title: "", description: "" }],
        inclusions: [""],
        exclusions: [""],
        cancellationPolicy: "",
      });
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(error.message || "Error saving package");
    }
  };

  // Delete package
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;

    const token = localStorage.getItem("adminToken");
    
    try {
      const response = await fetch(`http://localhost:3000/api/packages/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete package');
      }

      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error(error.message || "Error deleting package");
    }
  };

  // Edit package
  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destination,
      price: pkg.price,
      duration: pkg.duration,
      itinerary: pkg.itinerary,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      cancellationPolicy: pkg.cancellationPolicy,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tour Packages</h1>
        <Button 
          onClick={() => {
            setSelectedPackage(null);
            setFormData({
              title: "",
              description: "",
              destination: "",
              price: { amount: 0, currency: "₹" },
              duration: { days: 0, nights: 0 },
              itinerary: [{ day: 1, title: "", description: "" }],
              inclusions: [""],
              exclusions: [""],
              cancellationPolicy: "",
            });
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          Add New Package
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedPackage ? "Edit Package" : "Add New Package"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Price Amount</label>
                  <input
                    type="number"
                    value={formData.price.amount}
                    onChange={(e) => setFormData({
                      ...formData,
                      price: { ...formData.price, amount: Number(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Days</label>
                  <input
                    type="number"
                    value={formData.duration.days}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: { ...formData.duration, days: Number(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* File uploads */}
              <div>
                <label className="block mb-1">Images (Max 3)</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    if (e.target.files.length > 3) {
                      toast.error("Maximum 3 images allowed");
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              <div>
                <label className="block mb-1">PDF Brochure</label>
                <input
                  type="file"
                  name="pdfBrochure"
                  accept=".pdf"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPackage(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {selectedPackage ? "Update" : "Create"} Package
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-4">Loading packages...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg._id}>
                <TableCell>{pkg.title}</TableCell>
                <TableCell>{pkg.destination}</TableCell>
                <TableCell>{pkg.price.currency} {pkg.price.amount}</TableCell>
                <TableCell>{pkg.duration.days} days</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(pkg)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(pkg._id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}