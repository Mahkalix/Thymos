"use client";
import React from "react";
import "tailwindcss/tailwind.css";

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
    console.log("Déconnexion");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white p-4 flex justify-between items-center">
        <h1 className="text-1xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Se déconnecter
        </button>
      </header>
      <main className="p-4"></main>
    </div>
  );
};

export default Dashboard;
