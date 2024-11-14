"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const availableMoods = [
    { icon: "😊", name: "Happy" },
    { icon: "😢", name: "Sad" },
    { icon: "😆", name: "Excited" },
    { icon: "😌", name: "Calm" },
    { icon: "😬", name: "Anxious" },
  ];

  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) {
          throw new Error("Utilisateur non connecté");
        }
        const data = await res.json();
        setUserId(data.id);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchUserId();
  }, []);

  const handleMoodClick = (mood) => {
    setSelectedMood((prevMood) => (prevMood?.name === mood.name ? null : mood));
  };

  const saveMood = async () => {
    if (!userId) {
      setError("L'ID utilisateur est requis pour enregistrer l'humeur.");
      return;
    }
    if (!selectedMood) {
      setError("Veuillez sélectionner une humeur.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moods: [selectedMood.name], // Envoi sous forme de tableau pour compatibilité avec le back
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Échec de l'enregistrement de l'humeur"
        );
      }

      router.push(`/playlist?mood=${selectedMood.name}`);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
        <h1 className="text-2xl text-white font-bold mb-8">
          How are you feeling?
        </h1>

        {loading ? (
          <p className="text-lg text-white">Chargement...</p>
        ) : (
          <div className="flex flex-wrap gap-6 mb-8">
            {availableMoods.map((mood, index) => (
              <div
                key={index}
                onClick={() => handleMoodClick(mood)}
                className={`flex items-center justify-center w-32 h-32 rounded-full shadow-lg cursor-pointer transform transition duration-300 ${
                  selectedMood?.name === mood.name
                    ? "bg-gray-300"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <span className="text-4xl">{mood.icon}</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          onClick={saveMood}
          className="px-6 py-2 bg-black text-white font-bold rounded-lg focus:outline-none hover:bg-gray-800 transition duration-300"
          disabled={loading || !selectedMood}
        >
          Save
        </button>
      </div>
    </>
  );
}
