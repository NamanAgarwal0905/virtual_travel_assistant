"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Hotel {
  hotel_id: string;
  name: string;
  image: string;
  description: string;
  facilities: string[];
}

const Hotels = () => {
  const { destination } = useParams(); // Get dynamic segment from the URL

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Destination:", destination); // Debugging

    if (!destination) return;

    const fetchHotels = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/hotels", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ destination }), 
          });
        console.log(response)
        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }
        const data = await response.json();
        setHotels(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [destination]); // Fetch when destination changes

  if (loading) return <p className="text-white">Loading hotels...</p>;
  if (error) return <p className="text-white">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Hotels in {destination}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.hotel_id} className="border rounded-lg p-4 shadow-lg">
            <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover rounded-md" />
            <h2 className="text-xl font-semibold mt-2">{hotel.name}</h2>
            <p className="text-sm text-gray-600">{hotel.description}</p>
            <ul className="mt-2">
              {hotel.facilities.slice(0, 5).map((facility, index) => (
                <li key={index} className="text-sm text-gray-500">• {facility}</li>
              ))}
            </ul>
            <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
