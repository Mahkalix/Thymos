import { getCookie } from "cookies-next";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const userId = getCookie("id", { req });
  const email = getCookie("email", { req });
  const password = getCookie("password", { req });

  console.log("ID from cookie:", userId);
  console.log("Email from cookie:", email);
  console.log("Mot de passe from cookie:", password);

  if (!userId && !email && !password) {
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

  return new Response(
    JSON.stringify({ id: userId, email: email, password: password }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// Methode delete
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

  try {
    console.log("Recherche de l'utilisateur dans la base de données...");
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("Utilisateur non trouvé.");
      return new Response(
        JSON.stringify({ message: "Utilisateur non trouvé." }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Suppression de l'utilisateur...");
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log("Utilisateur supprimé:", userId);

    return new Response(JSON.stringify({ message: "Utilisateur supprimé." }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return new Response(
      JSON.stringify({ message: "Erreur lors de la suppression." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
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

  const { email, newPassword, profileImage } = await req.json();

  if (!email || !newPassword || !profileImage) {
    return new Response(
      JSON.stringify({ message: "Données manquantes pour la mise à jour." }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email,
        password: newPassword,
        profileImage: profileImage,
      },
    });

    console.log("Utilisateur mis à jour:", updatedUser);

    return new Response(
      JSON.stringify({ message: "Utilisateur mis à jour." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return new Response(
      JSON.stringify({ message: "Erreur lors de la mise à jour." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
