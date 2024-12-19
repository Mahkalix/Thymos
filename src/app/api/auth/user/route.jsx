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

//methode delete

export async function DELETE(req) {
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

  // Delete user logic here

  return new Response(JSON.stringify({ message: "Utilisateur supprimé." }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

//methode update

export async function PATCH(req) {
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

  // Update user logic here

  return new Response(JSON.stringify({ message: "Utilisateur mis à jour." }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
