"use client"
import { useEffect, useState, useContext } from "react";
import { useUser} from "../context/UserContext";

interface Trip {
  tripType: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  userId: string;
}

const MyTrips = () => {
  const { userId } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/my-trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        });
        if (!response.ok) throw new Error("Failed to fetch trips");
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTrips();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.length > 0 ? (
          trips.map((trip, index) => (
            <div key={index} className="shadow-lg rounded-xl border p-4">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-white">{trip.destination}</h2>
                <p className="text-sm text-white">{trip.tripType} Trip</p>
              </div>
              <div>
                <p className="text-white"><strong>Start Date:</strong> {new Date(trip.startDate).toISOString().split('T')[0]}</p>
                <p className="text-white"><strong>End Date:</strong> {new Date(trip.endDate).toISOString().split('T')[0]}</p>
                <p className="text-white"><strong>Duration:</strong> {trip.duration} days</p>
              </div>
            </div>
          ))
        ) : (
          <p>No trips planned yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
