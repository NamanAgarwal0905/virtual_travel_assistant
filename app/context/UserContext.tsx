"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  username: string;
  userId: string;
  setUsername: (name: string) => void;
  setUserId: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedEmail = localStorage.getItem("userEmail");
        console.log(storedEmail);
        if (!storedEmail) return;

        const response = await fetch("http://localhost:3001/api/getUsername", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: storedEmail }),
        });

        const data = await response.json();
        setUsername(data.username);
        setUserId(data.userId);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []);

  return (
    <UserContext.Provider value={{ username, userId, setUsername, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
