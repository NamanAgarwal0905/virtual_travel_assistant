"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter(); 

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (!/(?=.*[A-Z])(?=.*[\W_]).{6,}/.test(password)) {
        toast.error("Password must contain at least one uppercase letter and one special character", { autoClose: 3000 });
        return;
      }      
      const result = await axios.post(`http://localhost:3001/api/auth/register`, {
        name,
        email,
        password,
      });
      if (result.data.success) {
        toast.success(result.data.message, { autoClose: 3000 });
        router.push("/login"); 
      } else {
        toast.error("Registration failed: " + result.data.message, {
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error in registration request:", err);
      toast.error("Email already exists", { autoClose: 3000 });
    }
  };

  return (
    <div className="bg flex justify-center items-center min-h-screen p-5">
      <div className="wrapper shadow-lg rounded-lg bg-white p-10">
        <form onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Create Your Account
          </h1>
          <div className="input-box mb-4">
            <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
              Name
            </label>
            <input
              className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              type="text"
              name="name"
              id="name"
              placeholder="Full Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="input-box mb-4">
            <label
              htmlFor="email"
              className="block text-sm text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="input-box mb-6">
            <label
              htmlFor="password"
              className="block text-sm text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              type="password"
              placeholder="Password"
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <button
            type="submit"
            className="btn w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            Register
          </button>
          <div className="text-center text-sm text-gray-600 mt-4">or</div>
          <button
            onClick={() =>
              (window.location.href = `http://localhost:3001/auth/google`)
            }
            id="oauth"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-red-600 transition duration-200 mt-4"
          >
            Register using Google
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SignUpPage;
