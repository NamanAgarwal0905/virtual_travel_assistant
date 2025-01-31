"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

interface Trip {
  tripType: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  userId: string;
}

const OngoingTrips = () => {
  const { userId } = useUser();
  const router = useRouter();
  const [ongoingTrips, setOngoingTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/my-trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error("Failed to fetch trips");
        const data: Trip[] = await response.json();

        const currentDate = new Date();
        const filteredTrips = data.filter((trip) => {
          const start = new Date(trip.startDate);
          const end = new Date(trip.endDate);
          return start <= currentDate && currentDate <= end;
        });

        setOngoingTrips(filteredTrips);
      } catch (error) {
        console.error("Error fetching ongoing trips:", error);
      }
    };

    fetchTrips();
  }, [userId]);

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Ongoing Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ongoingTrips.length > 0 ? (
          ongoingTrips.map((trip, index) => (
            <div
              key={index}
              className="shadow-lg rounded-xl p-4 border cursor-pointer hover:bg-gray-800 transition duration-300"
              onClick={() => router.push(`/ongoing-trips/${trip.destination}`)}
            >
              <h2 className="text-lg font-semibold text-white">{trip.destination}</h2>
              <p className="text-sm text-white">{trip.tripType} Trip</p>
              <p className="text-white"><strong>Start Date:</strong> {trip.startDate}</p>
              <p className="text-white"><strong>End Date:</strong> {trip.endDate}</p>
              <p className="text-white"><strong>Duration:</strong> {trip.duration} days</p>
              <div className="relative w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full text-white"
                  style={{ width: `${calculateProgress(trip.startDate, trip.endDate)}%` }}
                ></div>
              </div>
              <p className="text-sm text-white mt-1">
                Progress: {Math.round(calculateProgress(trip.startDate, trip.endDate))}%
              </p>
            </div>
          ))
        ) : (
          <p className="text-white">No ongoing trips at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default OngoingTrips;
