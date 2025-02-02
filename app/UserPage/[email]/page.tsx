"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import DestinationCard from "../../../components/DestinationCard";

interface Trip {
  name: string;
  category?: string;
  image?: string;
}

const HomePage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const router = useRouter();
  const { username ,userId} = useUser();
  useEffect(() => {
    console.log(userId)
    const fetchTrips = async () => {
      if (!userId) return; // Ensure userId is available
  
      try {
        const response = await fetch("http://localhost:3001/api/recommendations/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch recommended destinations");
        }
        console.log(response)
        const data = await response.json();
        setTrips(data.recommendations); // Update state with recommended trips
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };
  
    fetchTrips();
  }, [userId]);
  
  

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col relative">
      <div className="absolute top-4 left-4">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-500"
          onClick={() => router.push("/my-trips")}
        >
          My Trips
        </button>
        <button
          className="bg-purple-600 text-white mx-4 py-2 rounded-lg shadow-md px-2 hover:bg-purple-500"
          onClick={() => router.push("/ongoing-trips")}
        >
          Ongoing Trips
        </button>
      </div>
      <h1 className="text-4xl font-bold text-center mt-6">Hello, {username}!</h1>
      <p className="text-gray-500 text-center mb-6">Recommended trip destinations for you</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-6xl">
        {trips.length > 0 ? (
          trips.map((trip, index) => <DestinationCard key={index} destination={trip} />)
        ) : (
          <p>Loading destinations...</p>
        )}
      </div>
      <div className="absolute bottom-4 right-4">
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-500"
          onClick={() => router.push("/plan-trip")}
        >
          Plan a New Trip
        </button>
      </div>
      <div className="absolute bottom-4 left-4">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-500"
          onClick={() => router.push("/trip-advisor")}
        >
          Talk to Trip Advisor
        </button>
      </div>
    </div>
  );
};

export default HomePage;
