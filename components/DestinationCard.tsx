import React from "react";

interface Destination {
  name: string;
  category?: string;
  image?: string; // Image is optional
}

const DestinationCard: React.FC<{ destination: Destination }> = ({ destination }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {destination.image && ( // Only display the image if it exists
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-56 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold">{destination.name || "Unknown Destination"}</h2>
        {destination.category && <p className="text-gray-600">{destination.category}</p>}
      </div>
    </div>
  );
};

export default DestinationCard;
