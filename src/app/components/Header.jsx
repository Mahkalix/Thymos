"use client";

import { useRouter } from "next/navigation";

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
    <header className="flex justify-between items-center bg-black p-4">
      <div>
        <h1 className="text-xl text-white font-bold">Mon Dashboard</h1>
      </div>
      <div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
