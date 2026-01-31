import React from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ Import Toaster here

function AccessDenied({ route, page }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#130f2a] text-white p-6">
      <Toaster />
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Access Denied</h1>
      <p className="text-gray-300 mb-6 text-center">
        You need to be logged in to access this page.
      </p>
      <button
        onClick={() => navigate(`${route}`)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full text-lg font-medium hover:opacity-90 transition-all duration-300"
      >
        Go to {page}
      </button>
    </div>
  );
}

export default AccessDenied;