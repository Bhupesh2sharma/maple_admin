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

  const checkServerStatus = async () => {
    try {
      const response = await fetch('https://maple-server-e7ye.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        toast.warning('Server might be experiencing issues. Login may be delayed.');
      }
    } catch (err) {
      toast.error('Server appears to be offline. Please try again later.');
    }
  };

  useEffect(() => {
    // Check for existing admin session
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin");
    } else {
      checkServerStatus(); // Check server status when component mounts
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
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://maple-server-e7ye.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Error during login:", err);
      
      // More specific error messages based on the error type
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        toast.error('Unable to connect to the server. Please check your internet connection or try again later.');
        setError('Connection error - Server might be down or unreachable');
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
        setError('Request timed out - Server took too long to respond');
      } else {
        toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
        setError('Login failed - Please try again');
      }
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
