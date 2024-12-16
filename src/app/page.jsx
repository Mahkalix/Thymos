"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/Logo.webp";
import Footer from "../app/components/Footer";
import Vinyle from "../../public/vinyle.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Connexion réussie !");
      window.location.href = "/dashboard";
    } else {
      setError(data.message || "Identifiants invalides. Veuillez réessayer.");
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-between items-center bg-white p-4 shadow-md">
          <div className="flex items-center">
            <Image
              className="ml-0"
              width={80}
              height={80}
              src={logo}
              alt="logo"
            />
            <h1 className="ml-3 text-2xl font-light font-custom text-[#e53928]">
              Thymos
            </h1>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center bg-vinyle p-4">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl text-black font-normal text-center">
              Connexion
            </h1>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-black"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-gray-500 w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-black"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-black"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-gray-500 w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-black"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-sm text-white bg-black rounded-full focus:outline-none"
              >
                Log in
              </button>
            </form>
            <button
              onClick={handleRegister}
              className="w-full px-4 py-2 font-sm text-white bg-black rounded-full focus:outline-none"
            >
              Register
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
