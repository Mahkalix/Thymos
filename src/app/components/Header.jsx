"use client";

import { useRouter } from "next/navigation";
import logo from "../../../public/Logo.png";
import Image from "next/image";

export default function Header() {
  const router = useRouter();

  // Fonction de déconnexion
  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      router.push("/");
    } else {
      console.error("Échec de la déconnexion");
      alert("Erreur lors de la déconnexion");
    }
  };

  return (
    <header className="flex justify-between items-center bg-white p-4 shadow-md">
      <a href="/dashboard" className=" items-center">
        <Image className="ml-3" width={50} height={50} src={logo} alt="logo" />
        <h1 className="ml-3 text-xl text-black font-bold">Mood</h1>
      </a>

      <div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-black text-white font-bold rounded-lg focus:outline-none"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
