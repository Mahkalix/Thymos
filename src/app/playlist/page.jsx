"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import withAuth from "../../hoc/withAuth";
import Image from "next/image";
const Playlist = () => {
  const [mood, setMood] = useState("Calm");
  const [playlists, setPlaylists] = useState([]);
  const [userMoods, setUserMoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = "ton_access_token";
  const router = useRouter();

  const fetchUserMoods = async (userId) => {
    try {
      const response = await fetch("/api/moods", {
        method: "GET",
        headers: {
          "x-user-id": userId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching moods:", errorData.message);
        return [];
      }

      const moods = await response.json();
      return moods;
    } catch (error) {
      console.error("Error fetching moods:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchMoods = async () => {
      const moods = await fetchUserMoods(1);
      setUserMoods(moods);
      if (moods.length > 0) {
        setMood(moods[0]);
      }
      setIsLoading(false);
    };

    fetchMoods();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const url = `/api/spotify?mood=${mood}&accessToken=${accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        console.error("Erreur API Spotify:", data.error);
      } else {
        setPlaylists(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des playlists:", error);
    }
  };

  useEffect(() => {
    if (mood) {
      fetchPlaylists();
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-t-8 border-b-8 border-white"></div>
      </div>
    );
  }

  const handleClick = () => {
    router.push("/dashboard");
  };
  console.log(playlists);
  return (
    <>
      <Header />
      <div className="container mx-auto p-8 m-7">
        <motion.div
          className="mb-10 w-11 cursor-pointer p-2 bg-white text-black rounded-full shadow-lg hover:transition duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
        >
          <span className="text-xl">←</span>
        </motion.div>

        <div className="mb-6">
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {playlists.map((playlist, index) => {
                if (playlist && playlist.images && playlist.images.length > 0) {
                  return (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                    >
                      <img
                        src={
                          playlist.images[0]?.url ||
                          "https://via.placeholder.com/300x300?text=No+Image"
                        }
                        alt={playlist.name}
                        className="w-full object-cover h-64" /* Ajuste la hauteur de l'image */
                      />

                      <div className="p-4">
                        <a
                          href={playlist.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center bg-green-600 text-white py-2 px-2 rounded-full shadow-lg hover:bg-green-700 transition duration-300"
                        >
                          Écouter sur Spotify
                        </a>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <p className="text-white flex items-center justify-center text-lg">
              Aucune playlist trouvée...
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(Playlist);
