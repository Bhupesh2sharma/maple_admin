"use client";
import { useState, useEffect } from "react";
import React from "react";

const AdminAvailability = () => {
    const [date, setDate] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [availableDates, setAvailableDates] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch available dates
    useEffect(() => {
        const fetchAvailableDates = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/availability/available-dates");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setAvailableDates(data.dates);
            } catch (error) {
                console.error("Error fetching available dates:", error);
            } finally {
                setLoading(false); // Stop loading after fetch completes
            }
        };

        fetchAvailableDates();
    }, []);

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/availability/set", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, isAvailable }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            alert(data.message);

            // Refresh available dates after successful submission
            setAvailableDates((prev) => [...prev, date]);
        } catch (error) {
            console.error("Error submitting availability:", error);
            alert("Failed to save availability. Please try again.");
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg max-w-lg mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Set Tour Availability</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Date:</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        required 
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-green-300"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input 
                        type="checkbox" 
                        checked={isAvailable} 
                        onChange={() => setIsAvailable(!isAvailable)} 
                        className="h-5 w-5 text-green-500"
                    />
                    <label className="text-gray-700 font-medium">Available</label>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition"
                >
                    Save
                </button>
            </form>

            <h3 className="text-lg font-semibold mt-6 text-gray-800">Available Dates</h3>

            {loading ? (
                <p className="text-gray-500 text-center">Loading available dates...</p>
            ) : (
                <div className="grid grid-cols-2 gap-2 mt-3">
                    {availableDates.length > 0 ? (
                        availableDates.map((date, index) => (
                            <div 
                                key={index} 
                                className="p-2 bg-green-100 text-green-800 font-medium rounded-md text-center shadow-sm"
                            >
                                {new Date(date).toDateString()}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No available dates</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAvailability;
