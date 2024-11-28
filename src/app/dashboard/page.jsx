"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "../components/Header";
import withAuth from "../../hoc/withAuth";

function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const availableMoods = [
    { icon: "😊", name: "Happy", color: "#FFD700" },
    { icon: "😢", name: "Sad", color: "#1E90FF" },
    { icon: "😆", name: "Excited", color: "#FF4500" },
    { icon: "😌", name: "Calm", color: "#98FB98" },
    { icon: "😬", name: "Anxious", color: "#8A2BE2" },
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
          moods: [selectedMood.name],
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <motion.div
          animate={{
            backgroundColor: selectedMood?.color || "bg-vinyle",
          }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col items-center justify-center flex-grow ${
            selectedMood === null ? "bg-vinyle" : "bg-vinyle"
          }`}
        >
          <h1 className="text-2xl text-white font-bold mb-8">
            How are you feeling ?
          </h1>

          {loading ? (
            <p className="text-lg text-white">Chargement...</p>
          ) : (
            <div className="flex flex-wrap gap-6 mb-8">
              {availableMoods.map((mood, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleMoodClick(mood)}
                  whileHover={{ scale: 1.1 }} // Animation au survol
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-center w-32 h-32 rounded-full shadow-lg cursor-pointer`}
                  style={{
                    backgroundColor:
                      selectedMood?.name === mood.name ? mood.color : "white",
                    border: selectedMood?.name === mood.name ? "none" : "none",
                    boxShadow:
                      selectedMood?.name === mood.name
                        ? "0 0 15px rgba(0, 0, 0, 0.3)"
                        : "none",
                    borderWidth:
                      selectedMood?.name === mood.name ? "3x" : "2px",
                    opacity: selectedMood?.name === mood.name ? 1 : 1,
                  }}
                >
                  <span className="text-4xl">{mood.icon}</span>
                </motion.div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <motion.button
            onClick={saveMood}
            className="px-6 py-2 bg-black text-white font-sm rounded-full focus:outline-none  transition duration-300"
            disabled={loading || !selectedMood}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Save
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}

export default withAuth(DashboardPage);
