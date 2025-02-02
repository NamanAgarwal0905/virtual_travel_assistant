"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Hotel {
  HotelCode: string;
  HotelName: string;
  HotelRating: string;
  Address: string;
  CountryName: string;
  CityName: string;
  Latitude: string;
  Longitude: string;
}

const Hotels = () => {
  const { destination } = useParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Destination:", destination); // Debugging

  useEffect(() => {
    if (!destination) {
      console.log("No destination provided");
      setLoading(false);
      return;
    }

    const fetchHotels = async () => {
      try {
        console.log("Fetching hotels for:", destination);
        const response = await fetch("http://localhost:3001/api/hotels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ destination }),
        });

        console.log("API Response:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Failed to fetch hotels: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received hotel data:", data);
        setHotels(data); // Update state
      } catch (err: any) {
        console.error("Error fetching hotels:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [destination]);

  const getRatingStars = (rating: string) => {
    const stars = rating.replace("Star", "");
    return "⭐".repeat(parseInt(stars));
  };

  if (loading) return <p className="text-white">Loading hotels...</p>;
  if (error) return <p className="text-white">Error: {error}</p>;
  if (hotels.length === 0) return <p className="text-white">No hotels found</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Hotels in {destination}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.HotelCode} className="bg-white border rounded-lg p-4 shadow-lg">
            <img
              src={`/api/placeholder/400/300`}
              alt={hotel.HotelName}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mt-2">{hotel.HotelName}</h2>
            <div className="text-yellow-500 my-2">{getRatingStars(hotel.HotelRating)}</div>
            <p className="text-sm text-gray-600 mb-2">{hotel.Address}</p>
            <div className="text-sm text-gray-500">
              {hotel.CityName}, {hotel.CountryName}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Coordinates: {hotel.Latitude}, {hotel.Longitude}
            </div>
            <button className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
