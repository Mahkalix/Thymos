import { getCookie } from "cookies-next"; // Assurez-vous d'importer la fonction getCookie

export async function GET(req) {
  const userId = getCookie("id", { req });

  console.log("ID from cookie:", userId);

  if (!userId) {
    return new Response(
      JSON.stringify({ message: "Utilisateur non connecté." }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(JSON.stringify({ id: userId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
