"use client"; // ✅ This makes it a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Import from "next/navigation"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing admin session
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin");
    } else {
      // Show welcome back message if returning to login page
      toast.info("Welcome back! Please login to continue", {
        position: "top-right",
        autoClose: 3000
      });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('https://maple-server-e7ye.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));

        // Show success message
        toast.success("Login successful! Welcome back admin", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push("/admin")
        });
      } else {
        setError(data.message || "Invalid credentials");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center">Admin Login</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Welcome back! Please login to continue
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className={`w-full bg-zinc-500 text-white py-2 rounded hover:bg-zinc-600 transition-colors
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Add forgot password link if needed */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Forgot your password? Contact administrator
        </p>
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}
