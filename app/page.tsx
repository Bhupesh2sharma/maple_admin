"use client"; // ✅ This makes it a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Import from "next/navigation"

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, redirect to /admin
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Hardcoded credentials
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123";

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem("adminToken", "authenticated");
      router.push("/admin"); // Redirect after login
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded mt-1"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-zinc-500 text-white py-2 rounded ">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
