"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "react-toastify";
import { Carousel } from "@/components/ui/carousel";
import Image from "next/image";

interface Package {
  _id: string;
  title: string;
  description: string;
  destination: string;
  price: {
    amount: number;
    currency: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  images: { url: string; caption: string }[];
  pdfBrochure?: { url: string; filename: string };
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  featured: boolean;
  active: boolean;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    price: {
      amount: 0,
      currency: "₹"
    },
    duration: {
      days: 0,
      nights: 0
    },
    itinerary: [
      {
        day: 1,
        title: "",
        description: ""
      }
    ],
    inclusions: [""],
    exclusions: [""],
    cancellationPolicy: "",
    featured: false,
    active: true
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Fetch Packages
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("https://maple-server-e7ye.onrender.com/api/packages");
      const data = await response.json();
      if (data.success) {
          setPackages(data.data);
        } else {
        toast.error("Failed to fetch packages");
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Error loading packages");
    } finally {
      setLoading(false);
    }
  };

  // Create/Update Package
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    
    try {
      const formDataToSend = new FormData();
      
      // Structure the package data to match the backend schema
      const packageData = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        price: {
          amount: Number(formData.price.amount),
          currency: formData.price.currency || "₹"
        },
        duration: {
          days: Number(formData.duration.days),
          nights: Number(formData.duration.days) - 1
        },
        itinerary: formData.itinerary.map((item, index) => ({
          day: index + 1,
          title: item.title,
          description: item.description
        })),
        inclusions: formData.inclusions.filter(item => item.trim() !== ""),
        exclusions: formData.exclusions.filter(item => item.trim() !== ""),
        cancellationPolicy: formData.cancellationPolicy,
        featured: false,
        active: true
      };

      // Log the structured data for debugging
      console.log('Structured package data:', packageData);

      // Append the stringified package data
      formDataToSend.append("packageData", JSON.stringify(packageData));

      // Handle image files (maximum 3)
      const imageInput = document.querySelector('input[name="images"]');
      if (imageInput?.files && imageInput.files.length > 0) {
        Array.from(imageInput.files).forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Handle PDF file
      const pdfInput = document.querySelector('input[name="pdfBrochure"]');
      if (pdfInput?.files?.[0]) {
        formDataToSend.append("pdfBrochure", pdfInput.files[0]);
      }

      const url = selectedPackage 
        ? `https://maple-server-e7ye.onrender.com/api/packages/${selectedPackage._id}`
        : "https://maple-server-e7ye.onrender.com/api/packages";

      // Log the final FormData (for debugging)
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(url, {
        method: selectedPackage ? "PUT" : "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save package');
      }

      toast.success(selectedPackage ? "Package updated successfully" : "Package created successfully");
      setShowForm(false);
      setSelectedPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(error.message || "Error saving package");
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      destination: "",
      price: { amount: 0, currency: "₹" },
      duration: { days: 0, nights: 0 },
      itinerary: [
        {
          day: 1,
          title: "",
          description: ""
        }
      ],
      inclusions: [""],
      exclusions: [""],
      cancellationPolicy: "",
      featured: false,
      active: true
    });
  };

  // Delete Package
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`https://maple-server-e7ye.onrender.com/api/packages/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Package deleted successfully");
        fetchPackages();
      } else {
        throw new Error(data.message || "Failed to delete package");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete package");
    }
  };

  // Add function to handle itinerary changes
  const handleItineraryChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newItinerary = [...prev.itinerary];
      newItinerary[index] = {
        ...newItinerary[index],
        [field]: value
      };
      return {
        ...prev,
        itinerary: newItinerary
      };
    });
  };

  // Add function to add new itinerary day
  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: "",
          description: ""
        }
      ]
    }));
  };

  const PackageCards = () => {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Package Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-64">
                {pkg.images && pkg.images.length > 0 ? (
                  <Carousel>
                    {pkg.images.map((image, index) => (
                      <div key={index} className="relative w-full h-64 flex-shrink-0">
                        <Image
                          src={`https://maple-server-e7ye.onrender.com${image.url}`}
                          alt={image.caption || pkg.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">{pkg.title}</h3>
                
                <div className="flex justify-between items-center">
                  <div className="text-gray-600">
                    <p>{pkg.destination}</p>
                    <p>{pkg.duration.days} Days | {pkg.duration.nights} Nights</p>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {pkg.price.currency}{pkg.price.amount}
                  </div>
                </div>

                <p className="text-gray-600 line-clamp-3">{pkg.description}</p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Itinerary Highlights:</h4>
                  <div className="space-y-1">
                    {pkg.itinerary.slice(0, 3).map((day, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        <span className="font-medium">Day {day.day}:</span> {day.title}
                      </p>
                    ))}
                    {pkg.itinerary.length > 3 && (
                      <p className="text-sm text-blue-600">+ {pkg.itinerary.length - 3} more days</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inclusions:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {pkg.inclusions.slice(0, 3).map((item, index) => (
                        <li key={index} className="truncate">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Exclusions:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {pkg.exclusions.slice(0, 3).map((item, index) => (
                        <li key={index} className="truncate">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  {pkg.pdfBrochure && (
                    <a
                      href={`https://maple-server-e7ye.onrender.com${pkg.pdfBrochure.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Brochure
                    </a>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setFormData(pkg);
                        setShowForm(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(pkg._id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tour Packages</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedPackage ? "Edit Package" : "Add New Package"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
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
                    <label className="block mb-1">Price</label>
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

                <div className="space-y-4">
                  <label className="block font-bold">Itinerary</label>
                  {formData.itinerary.map((day, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded">
                      <div>
                        <label className="block mb-1">Day {day.day} Title</label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Description</label>
                        <textarea
                          value={day.description}
                          onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    + Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="block mb-1">Images (Max 3)</label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 3) {
                        toast.error("Maximum 3 images allowed");
                        e.target.value = "";
                      }
                    }}
                    className="w-full p-2 border rounded"
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
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPackage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPackage ? "Update" : "Create"} Package
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setFormData(pkg);
                        setShowForm(true);
                      }}
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

      <PackageCards />
    </div>
  );
}