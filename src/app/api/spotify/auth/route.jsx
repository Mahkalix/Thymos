export async function GET(req) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI; // Assure-toi que cette URI est configurée dans ton dashboard Spotify
  const scope = "user-read-private user-read-email playlist-read-private"; // Les scopes dont tu as besoin pour l'API Spotify

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;

  return Response.redirect(authUrl);
}
