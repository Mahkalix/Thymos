// src/app/api/spotify/route.jsx

import getSpotifyData from "@/lib/spotify"; // Utilisation de la fonction getSpotifyData

export async function GET(req) {
  // Récupérer les paramètres query de l'URL
  const { searchParams } = new URL(req.url);
  const mood = searchParams.get("mood");
  const accessToken = searchParams.get("accessToken");

  // Vérifier si les paramètres sont présents
  if (!mood || !accessToken) {
    return new Response(
      JSON.stringify({ error: "Humeur ou access token manquant" }),
      { status: 400 }
    );
  }

  try {
    // Appel à Spotify pour récupérer des playlists
    const playlistsData = await getSpotifyData("browse/featured-playlists"); // Endpoint Spotify, tu peux ajuster selon l'humeur
    const playlists = playlistsData.playlists.items;

    // Tu peux ajouter une logique pour filtrer les playlists selon l'humeur ici si nécessaire

    return new Response(JSON.stringify(playlists), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des playlists:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'interrogation de Spotify" }),
      { status: 500 }
    );
  }
}
