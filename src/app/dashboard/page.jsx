"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function DashboardPage() {
  const [moods, setMoods] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const availableMoods = ["Happy", "Sad", "Excited", "Calm", "Anxious"];
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/auth/user");

        if (!res.ok) {
          throw new Error("Utilisateur non connecté");
        }

        const data = await res.json();
        // console.log(data.id);
        setUserId(data.id);
        console.log("User Retrieve");
      } catch (err) {
        console.error(err);

        setError(err.message);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchMoods = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const res = await fetch("/api/moods", {
          method: "GET",
          headers: {
            "x-user-id": userId,
            "Content-Type": "application/json",
          },
        });
        console.log("fetchMoods, ok");

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Échec de la récupération des humeurs"
          );
        }

        const data = await res.json();
        setMoods(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, [userId]);

  const handleMoodClick = (mood) => {
    setSelectedMoods((prevSelectedMoods) =>
      prevSelectedMoods.includes(mood)
        ? prevSelectedMoods.filter((m) => m !== mood)
        : [...prevSelectedMoods, mood]
    );
  };

  const saveMoods = async () => {
    if (!userId) {
      setError("L'ID utilisateur est requis pour enregistrer les humeurs.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("Tentative de sauvegarde des humeurs:", selectedMoods);
    console.log("ID utilisateur:", userId);

    try {
      const res = await fetch("/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moods: selectedMoods, userId }),
      });

      console.log("Réponse du serveur:", res);
      if (res.ok) {
        router.push(`/playlist?moods=${selectedMoods.join(",")}`);
      }
      if (!res.ok) {
        // Vérifie si le serveur a répondu avec une erreur
        // Ajout d'une vérification pour s'assurer que la réponse est un JSON valide
        let errorData;
        try {
          errorData = await res.json();
        } catch (jsonErr) {
          console.error("Erreur lors de l'analyse du JSON:", jsonErr);
          throw new Error("Erreur inconnue lors de la sauvegarde des humeurs.");
        }
        console.error("Erreur renvoyée par le serveur:", errorData);
        throw new Error(
          errorData.message || "Échec de l'enregistrement des humeurs"
        );
      }

      // const result = await res.json();
      // console.log("Humeurs enregistrées avec succès:", result);

      // alert("Humeurs enregistrées avec succès !");
      // setSelectedMoods([]);
    } catch (err) {
      console.error("Erreur dans saveMoods:", err);
      setError(err.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-1xl text-black font-bold mb-6">
          Choisissez votre humeur :
        </h1>

        {loading ? (
          <p className="text-lg">Chargement...</p>
        ) : (
          <div className="flex flex-wrap gap-4 mb-6">
            {availableMoods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  selectedMoods.includes(mood)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={saveMoods}
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          disabled={loading}
        >
          Enregistrer les humeurs
        </button>

        {error && <p className="text-red-500">{error}</p>}

        <h2 className="text-1xl mt-8 mb-4 text-black">
          Vos humeurs actuelles :
        </h2>
        <ul className="px-4 py-2 rounded-lg font-semibold text-black">
          {moods.map((mood, index) => (
            <li key={index} className="text-xl">
              {mood}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
