"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

const HeroSection = () => {
  const [tripType, setTripType] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);
  const { userId } = useUser(); 

  // Fetch destinations from backend
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/destinations");
        const data = await response.json();
        setDestinations(data.destinations);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    };

    fetchDestinations();
  }, []);

  const handleDateChange = (start: string | null, end: string | null) => {
    if (start && end) {
      const startDt = new Date(start);
      const endDt = new Date(end);
      const diffTime = Math.abs(endDt.getTime() - startDt.getTime());
      const calculatedDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setDuration(calculatedDuration);
    } else {
      setDuration(null);
    }
  };

  const handleSubmit = async () => {
    if (!tripType || !destination || !startDate || !endDate || !duration) {
      alert("Please fill in all the fields.");
      return;
    }

    const tripData = {
      tripType,
      destination,
      startDate,
      endDate,
      duration,
      userId,
    };

    try {
      const response = await fetch("http://localhost:3001/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Trip created successfully: ${JSON.stringify(data.trip)}`);
      } else {
        alert(`Error creating trip: ${data.message}`);
      }
    } catch (error) {
      alert("Error submitting the trip data.");
    }
  };

  return (
    <div className="h-auto my-10 mt-10 md:h-[50rem] w-full rounded-md flex flex-col items-center justify-center relative overflow-hidden mx-auto md:py-0">
      <div className="p-4 relative z-10 w-full text-center">
        <h1 className="text-4xl font-bold text-white mt-10">Plan Your Trip</h1>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          
          {/* Trip Type Card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Select Trip Type</h2>
            <div className="flex flex-col gap-2">
              {["Solo", "Family", "Friends"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type)}
                  className={`px-4 py-2 rounded-md ${tripType === type ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Select Destination</h2>
            <select
              value={destination || ""}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="" disabled>Choose a destination</option>
              {destinations.map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>

          {/* Date and Duration Card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Select Dates</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-semibold">Start Date:</label>
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => {
                    const start = e.target.value;
                    setStartDate(start);
                    handleDateChange(start, endDate);
                  }}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">End Date:</label>
                <input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => {
                    const end = e.target.value;
                    setEndDate(end);
                    handleDateChange(startDate, end);
                  }}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {duration !== null && (
                <div className="text-lg font-semibold">
                  Duration: {duration} {duration === 1 ? "Day" : "Days"}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-8 px-6 py-2 bg-blue-500 text-white font-semibold rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
