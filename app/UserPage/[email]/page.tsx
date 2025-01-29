'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Trip {
  destination: string;
  description: string;
  image: string;
}

const trips: Trip[] = [
  {
    destination: "Paris, France",
    description: "Experience the romance and rich history of Paris.",
    image: "/paris.jpg",
  },
  {
    destination: "Kyoto, Japan",
    description: "Discover the temples and cherry blossoms of Kyoto.",
    image: "/kyoto.jpg",
  },
  {
    destination: "Santorini, Greece",
    description: "Relax in the white and blue paradise of Santorini.",
    image: "/santorini.jpg",
  },
];

const HomePage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("userName");
    if (storedUser) setUsername(storedUser);
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
        {trips.map((trip, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Image src={trip.image} alt={trip.destination} width={400} height={250} className="w-full h-56 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{trip.destination}</h2>
              <p className="text-gray-600 mt-2">{trip.description}</p>
            </div>
          </div>
        ))}
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
