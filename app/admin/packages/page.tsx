"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, Edit } from "lucide-react";

export default function PackageList() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("https://maple-backend-two.vercel.app/api/packages");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch packages");
      setPackages(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const response = await fetch(`https://maple-backend-two.vercel.app/api/packages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete package");
      setPackages((prev) => prev.filter((pkg) => pkg._id !== id));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold">Package Management</h1>
      {errorMessage && <div className="bg-red-200 p-3 rounded-md">{errorMessage}</div>}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {packages.map((pkg) => (
            <div key={pkg._id} className="p-4 border rounded-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{pkg.title}</h2>
                <p className="text-gray-600">{pkg.description}</p>
                <p className="text-green-600 font-bold">${pkg.price}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => router.push(`/admin/packages/edit/${pkg._id}`)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(pkg._id)}>
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
