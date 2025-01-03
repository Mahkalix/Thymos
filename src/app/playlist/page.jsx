"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import Header from "../components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import withAuth from "../../hoc/withAuth";

const PlaylistContent = () => {
  const [mood, setMood] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [userMoods, setUserMoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = "ton_access_token";
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const moodParam = searchParams.get("mood");
    if (moodParam) {
      setMood(moodParam);
    }
  }, [searchParams]);

  // Fetch moods for the user
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

  // Available moods
  const availableMoods = useMemo(
    () => [
      { icon: " 😊", name: "Happy", color: "#FFD700" },
      { icon: " 😢", name: "Sad", color: "#1E90FF" },
      { icon: " 😮​", name: "Surprised", color: "#FF4500" },
      { icon: " 😐​", name: "Neutral", color: "#98FB98" },
      { icon: " 😤", name: "Angry", color: "#8A2BE2" },
    ],
    []
  );

  useEffect(() => {
    const fetchMoods = async () => {
      const moods = await fetchUserMoods(1);
      setUserMoods(moods);
      if (moods.length > 0) {
        setMood(moods[0].name); // Ensure the mood state is set correctly
      }
      setIsLoading(false);
    };

    fetchMoods();
  }, []);

  // Fetch playlists based on mood
  const fetchPlaylists = useCallback(async () => {
    try {
      console.log("Fetching playlists for mood:", mood); // Log the current mood before making the API call
      console.log("Using accessToken:", accessToken); // Log the access token being sent in the request
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
  }, [mood, accessToken]);

  useEffect(() => {
    if (mood) {
      fetchPlaylists();
    }
  }, [mood, fetchPlaylists]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-t-white border-gray-700"></div>
      </div>
    );
  }

  const handleClick = () => {
    router.push("/dashboard");
  };

  const currentMood = availableMoods.find((m) => m.name === mood);

  return (
    <>
      <Header />

      <div className="flex flex-row container items-start gap-10 mx-44 pb-8 pt-8">
        <motion.div
          className="mb-10 w-10 h-10 cursor-pointer bg-white text-black rounded-full shadow-lg hover:bg-gray-100 hover:transition duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.div>
        <div className="text-4xl">
          {currentMood ? `${currentMood.icon}` : mood}
        </div>
      </div>

      <div className="mb-6 mx-44">
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
                      className="w-full object-cover h-64"
                    />
                    <div className="p-4">
                      <a
                        href={playlist.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center bg-green-600 text-white py-2 px-2 rounded-full shadow-lg hover:bg-green-700 transition duration-300"
                      >
                        Listen on Spotify
                      </a>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <p className="text-white flex items-center justify-center text-lg">
            No playlists found for this mood.
          </p>
        )}
      </div>
    </>
  );
};

const Playlist = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PlaylistContent />
  </Suspense>
);

export default withAuth(Playlist);
