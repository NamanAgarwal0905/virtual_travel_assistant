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
  const { username } = useUser();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // Fetch geocode information
        const geocodeResponse = await fetch(
          "https://api.geoapify.com/v1/geocode/search?text=38%20Upper%20Montagu%20Street%2C%20Westminster%20W1H%201LJ%2C%20United%20Kingdom&apiKey=2b1b2ce8aac54a59938f8c1e0776e07b"
        );
        const geocodeData = await geocodeResponse.json();
        console.log("Geocode Query:", geocodeData.query.text);

        if (!geocodeData.features || geocodeData.features.length === 0) {
          console.error("No location data found");
          return;
        }

        // Extract district and country
        const location = geocodeData.features[0].properties;
        const district = location.district || "westminster";
        const country = location.country || "united kingdom";

        console.log(`Fetching destinations for: ${district}, ${country}`);

        // Fetch tourist attractions
        const placesResponse = await fetch(
          `https://api.geoapify.com/v2/places?categories=tourism&filter=place:${district},${country}&limit=6&apiKey=2b1b2ce8aac54a59938f8c1e0776e07b`
        );
        const placesData = await placesResponse.json();

        if (!placesData.features || placesData.features.length === 0) {
          console.error("No tourist attractions found");
          return;
        }

        // Extract relevant destination data
        const tripsData = placesData.features.map((place: any) => ({
          name: place.properties.name || "Unknown Destination",
          category: place.properties.categories?.join(", ") || "No category available",
          image: place.properties.image, // Only use if provided
        }));

        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col relative">
      <div className="absolute top-4 left-4">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-500"
          onClick={() => router.push("/my-trips")}
        >
          My Trips
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
