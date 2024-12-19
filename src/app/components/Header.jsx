"use client";

import { useRouter } from "next/navigation";
import logo from "../../../public/Logo.webp";
import Image from "next/image";
import { usePathname } from "next/navigation";

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

  const isActive = (pathname) => usePathname() === pathname;

  return (
    <header className="flex justify-between items-center bg-white p-4 shadow-md">
      <a href="/dashboard" className="flex items-center">
        <Image className="ml-0" width={70} height={70} src={logo} alt="logo" />
        <h1 className="ml-1 text-2xl text-[#e53928] font-light font-custom">
          Thymos
        </h1>
      </a>

      <div className="flex items-center">
        <a
          href="/dashboard"
          className={`flex items-center mr-5 hover:underline ${
            isActive("/dashboard") ? "underline text-black" : "text-black"
          }`}
        >
          Dashboard
        </a>
        <a
          href="/account"
          className={`flex items-center mr-5 hover:underline ${
            isActive("/account") ? "underline text-black" : "text-black"
          }`}
        >
          Account
        </a>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-black text-white text-sm rounded-full focus:outline-none sm:px-6 sm:py-2"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
