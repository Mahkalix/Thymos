"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mood = "Happy"; // Par exemple, récupérer l'humeur depuis un état ou une base de données
  const accessToken = "ton_access_token"; // Assure-toi de récupérer correctement le token depuis ton backend ou d'un autre endroit

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/spotify?mood=${mood}&accessToken=${accessToken}`
        );
        if (!response.ok) {
          throw new Error("Impossible de récupérer les playlists");
        }
        const data = await response.json();
        setPlaylists(data); // Enregistrer les playlists dans l'état
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [mood, accessToken]); // Refaire l'appel à chaque fois que l'humeur ou le token changent

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <p className="text-xl text-center">Chargement des playlists...</p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {playlists.map((playlist, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <img
                src={playlist.images[0]?.url || "/default-image.jpg"} // Image de la playlist
                alt={playlist.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{playlist.name}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {playlist.description || "Pas de description"}
                </p>
                <a
                  href={playlist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-white bg-green-500 py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                  Écouter sur Spotify
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
