//AdminLogin.jsx
import React, { useState } from "react";
import { FaPhone, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [adminName , setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/admin/login",
        JSON.stringify({ admin_id: email, password }),   // ✅ stringify payload
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json", // ✅ tell backend it's JSON
          },
        }
      );

      if (res.data?.status === "success") {
        navigate("/admin");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/images/bg1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 text-white p-8 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 relative animate-slide-in-top">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 text-gray-300 hover:text-purple-400 transition-colors z-20 p-2 rounded-full hover:bg-white/10"
          aria-label="Go back to home"
        >
          <FaArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center mb-6 pt-6">
          <img
            src="/images/technothon_nameless.png"
            alt="Logo"
            className="h-14 w-auto mb-4 md:h-16"
          />
          <h2 className="text-3xl font-bold text-purple-300">Admin Log In</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm mb-1 text-gray-200">
              Admin ID
            </label>
            <input
              type="text"
              placeholder="Admin ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-200">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-between items-center">
            <button
              type="button"
              className="text-sm text-gray-300 hover:underline"
              onClick={() => {
                setEmail("");
                setPassword("");
                setError("");
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition duration-200 shadow-md"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;