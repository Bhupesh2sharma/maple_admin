"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function EditPackage() {
  const router = useRouter();
  const params = useParams(); // Get dynamic ID from URL
  const { id } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    features: "",
    itinerary: "",
    image: null as File | null,
  });

  // Fetch existing package details when editing
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/packages/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            price: data.price || "",
            duration: data.duration || "",
            features: data.features?.join(", ") || "",
            itinerary: data.itinerary?.join(", ") || "",
            image: null, // Image cannot be preloaded in file input
          });
        })
        .catch((error) => {
          console.error("Error fetching package:", error);
          setErrorMessage("Failed to load package details");
        });
    }
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, image: event.target.files![0] }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.title || formData.title.trim() === "") {
      setErrorMessage("Please enter a title");
      return;
    }
    if (!formData.description || formData.description.trim() === "") {
      setErrorMessage("Please enter a description");
      return;
    }
    if (!formData.price || formData.price === "0") {
      setErrorMessage("Please enter a valid price");
      return;
    }
    if (!formData.duration || formData.duration === "0") {
      setErrorMessage("Please enter a valid duration");
      return;
    }
    if (!formData.features || formData.features.trim() === "") {
      setErrorMessage("Please enter at least one feature");
      return;
    }
    if (!formData.itinerary || formData.itinerary.trim() === "") {
      setErrorMessage("Please enter at least one itinerary item");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("features", JSON.stringify(formData.features.split(",").map((item) => item.trim())));
      formDataToSend.append("itinerary", JSON.stringify(formData.itinerary.split(",").map((item) => item.trim())));

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(`http://localhost:5000/api/packages/${id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to update package");
      }

      router.push("/admin/packages");
      router.refresh();
    } catch (error: unknown) {
      console.error("Error:", error);
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold">Edit Package</h1>

      {errorMessage && <div className="bg-destructive/10 text-destructive p-3 rounded-md">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Package Title</Label>
          <Input id="title" value={formData.title} onChange={handleChange} placeholder="Enter package title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter package description"
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="1"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Enter duration"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Input
            id="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="Feature 1, Feature 2, Feature 3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="itinerary">Itinerary (comma-separated)</Label>
          <Input id="itinerary" value={formData.itinerary} onChange={handleChange} placeholder="Day 1, Day 2, Day 3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Upload New Image (Optional)</Label>
          <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Package
        </Button>
      </form>
    </div>
  );
}
