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

  // Liste des humeurs disponibles
  const availableMoods = ["Happy", "Sad", "Surprised", "Neutral", "Angry"];

  // Vérifier si l'humeur est valide
  if (!availableMoods.includes(mood)) {
    return new Response(JSON.stringify({ error: "Humeur non valide" }), {
      status: 400,
    });
  }

  // Map des moods aux genres ou ambiances Spotify
  let query = "";
  switch (mood) {
    case "Happy":
      query = "happy";
      break;
    case "Sad":
      query = "sad";
      break;
    case "Surprised":
      query = "chill";
      break;
    case "Neutral":
      query = "ambient";
      break;
    case "Angry":
      query = "angry";
      break;
    default:
      query = "pop";
      break;
  }

  try {
    // Appel à Spotify pour récupérer des playlists en fonction de l'humeur
    const playlistsData = await getSpotifyData(
      `search?q=${query}&type=playlist&limit=10`,
      accessToken
    );
    const playlists = playlistsData.playlists.items;

    return new Response(JSON.stringify(playlists), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des playlists:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'interrogation de Spotify" }),
      { status: 500 }
    );
  }
}
