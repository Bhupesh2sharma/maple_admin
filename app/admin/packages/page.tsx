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

interface PackageFormData {
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
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  featured: boolean;
  active: boolean;
  images: File[];
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>({
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
    active: true,
    images: []
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Fetch Packages
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://maple-server-e7ye.onrender.com/api/packages', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Add response status check
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data);
      } else {
        toast.error(data.message || "Failed to fetch packages");
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      if (err instanceof SyntaxError) {
        toast.error('Invalid response from server. Please try again later.');
      } else {
        toast.error('Failed to fetch packages. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const editPackage = (pkg: Package) => {
    // Convert Package to PackageFormData format
    const formData: PackageFormData = {
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destination,
      price: pkg.price,
      duration: pkg.duration,
      itinerary: pkg.itinerary,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      cancellationPolicy: pkg.cancellationPolicy,
      featured: pkg.featured,
      active: pkg.active,
      images: [] // Reset images array since we can't convert URLs to Files
    };
    
    setFormData(formData); // Now this should work without type errors
    // Set any other state needed for editing mode
    setSelectedPackage(pkg);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const fileArray = Array.from(e.target.files);
    if (fileArray.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    setImages(fileArray); // Update the images state
    setFormData(prev => ({
      ...prev,
      images: fileArray
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const submitFormData = new FormData();
      
      // Add basic fields as a JSON string
      const packageData = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        price: formData.price,
        duration: {
          days: formData.duration.days,
          nights: formData.duration.days - 1
        },
        itinerary: formData.itinerary,
        inclusions: formData.inclusions.filter(item => item.trim() !== ''),
        exclusions: formData.exclusions.filter(item => item.trim() !== ''),
        cancellationPolicy: formData.cancellationPolicy,
        featured: formData.featured,
        active: formData.active
      };

      // Append the JSON data
      submitFormData.append('packageData', JSON.stringify(packageData));
      
      // Add images
      formData.images.forEach((image) => {
        submitFormData.append('images', image);
      });
      
      // Add PDF if exists
      if (pdfFile) {
        submitFormData.append('pdfBrochure', pdfFile);
      }

      const response = await fetch('https://maple-server-e7ye.onrender.com/api/packages', {
        method: selectedPackage ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save package');
      }

      const data = await response.json();

      if (data.success) {
        toast.success(selectedPackage ? 'Package updated successfully' : 'Package created successfully');
        setShowForm(false);
        setSelectedPackage(null);
        fetchPackages();
        // Reset form
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
          featured: false,
          active: true,
          images: []
        });
        setImages([]);
        setPdfFile(null);
      } else {
        throw new Error(data.message || 'Failed to save package');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save package');
    }
  };

  // Add this function to handle PDF upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setPdfFile(e.target.files[0]);
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

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-lg sm:text-3xl font-bold px-1 mt-12">Tour Packages</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-sm sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading packages...</div>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Title</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">Destination</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Price</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">Duration</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm">{pkg.title}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">{pkg.destination}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm">{pkg.price.currency} {pkg.price.amount}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">{pkg.duration.days} days</TableCell>
                    <TableCell>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          onClick={() => {
                            editPackage(pkg);
                            setShowForm(true);
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 p-1 sm:p-2"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(pkg._id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 p-1 sm:p-2"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 px-1">Package Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48 sm:h-64">
                {pkg.images && pkg.images.length > 0 ? (
                  <Carousel>
                    {pkg.images.map((image, index) => (
                      <div key={index} className="relative w-full h-48 sm:h-64 flex-shrink-0">
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
                  <div className="h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No images available</p>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-xl font-bold text-gray-900">{pkg.title}</h3>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="text-sm sm:text-base text-gray-600">
                    <p>{pkg.destination}</p>
                    <p>{pkg.duration.days} Days | {pkg.duration.nights} Nights</p>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    {pkg.price.currency}{pkg.price.amount}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 line-clamp-2 sm:line-clamp-3">{pkg.description}</p>

                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Itinerary Highlights:</h4>
                  <div className="space-y-1">
                    {pkg.itinerary.slice(0, 2).map((day, index) => (
                      <p key={index} className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Day {day.day}:</span> {day.title}
                      </p>
                    ))}
                    {pkg.itinerary.length > 2 && (
                      <p className="text-xs sm:text-sm text-blue-600">
                        + {pkg.itinerary.length - 2} more days
                      </p>
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
                        editPackage(pkg);
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl">
              {/* Form Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {selectedPackage ? "Edit Package" : "Add New Package"}
                </h2>
              </div>

              {/* Scrollable Form Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form id="packageForm" onSubmit={handleSubmit} className="space-y-4">
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
                        onChange={handleImageUpload}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImages(images.filter((_, i) => i !== index));
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block mb-1">PDF Brochure</label>
                      <input
                        type="file"
                        name="pdfBrochure"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Inclusions</label>
                      <div className="space-y-2">
                        {formData.inclusions.map((inclusion, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={inclusion}
                              onChange={(e) => {
                                const newInclusions = [...formData.inclusions];
                                newInclusions[index] = e.target.value;
                                setFormData({ ...formData, inclusions: newInclusions });
                              }}
                              className="w-full p-2 border rounded"
                              required
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newInclusions = formData.inclusions.filter((_, i) => i !== index);
                                  setFormData({ ...formData, inclusions: newInclusions });
                                }}
                                className="text-red-600"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, inclusions: [...formData.inclusions, ""] })}
                          className="text-blue-600"
                        >
                          + Add Inclusion
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Exclusions</label>
                      <div className="space-y-2">
                        {formData.exclusions.map((exclusion, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={exclusion}
                              onChange={(e) => {
                                const newExclusions = [...formData.exclusions];
                                newExclusions[index] = e.target.value;
                                setFormData({ ...formData, exclusions: newExclusions });
                              }}
                              className="w-full p-2 border rounded"
                              required
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newExclusions = formData.exclusions.filter((_, i) => i !== index);
                                  setFormData({ ...formData, exclusions: newExclusions });
                                }}
                                className="text-red-600"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, exclusions: [...formData.exclusions, ""] })}
                          className="text-blue-600"
                        >
                          + Add Exclusion
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Cancellation Policy</label>
                      <textarea
                        value={formData.cancellationPolicy}
                        onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Form Footer */}
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t">
                <div className="flex justify-end gap-4">
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
                  <Button 
                    type="submit"
                    form="packageForm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {selectedPackage ? "Update" : "Create"} Package
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}