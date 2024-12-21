import { getCookie } from "cookies-next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Methode get retourne les informations de l'utilisateur
export async function GET(req) {
  const userId = getCookie("id", { req });
  const email = getCookie("email", { req });
  const password = getCookie("password", { req });
  const profileImage = getCookie("profileImage", { req });

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
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!user) {
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

    return new Response(
      JSON.stringify({
        id: user.id,
        email: user.email,
        password: user.password,
        profileImage: user.profileImage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);

    return new Response(
      JSON.stringify({
        message: "Erreur interne lors de la récupération.",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Methode delete
export async function DELETE(req) {
  // Récupération du cookie contenant l'ID utilisateur
  const userId = parseInt(getCookie("id", { req }), 10); // Conversion en entier

  // Vérification que l'utilisateur est connecté
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
    console.log(`Recherche de l'utilisateur avec ID : ${userId}...`);

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
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

    console.log("Suppression des MoodUser liés...");

    // Supprimer les entrées liées dans MoodUser
    await prisma.moodUser.deleteMany({
      where: { userId },
    });

    console.log("Suppression de l'utilisateur...");

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`Utilisateur ${userId} supprimé avec succès.`);

    return new Response(
      JSON.stringify({ message: "Utilisateur supprimé avec succès." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);

    return new Response(
      JSON.stringify({
        message: "Erreur interne lors de la suppression.",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Methode update
export async function PATCH(req) {
  const body = await req.json();
  console.log("Request body:", body);

  const { userId, newPassword, newProfileImage } = body;

  if (!userId) {
    return new Response(JSON.stringify({ message: "User ID is required." }), {
      status: 400,
    });
  }

  // Vérification de la validité du mot de passe
  if (newPassword && newPassword.length < 6) {
    return new Response(
      JSON.stringify({
        message: "Password must be at least 6 characters long.",
      }),
      { status: 400 }
    );
  }

  // Convertir userId en entier
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    return new Response(JSON.stringify({ message: "Invalid user ID." }), {
      status: 400,
    });
  }

  try {
    const updateData = {};

    // Si un nouveau mot de passe est fourni, le hacher et le mettre à jour
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Si une nouvelle image de profil est fournie, la mettre à jour
    if (newProfileImage !== undefined) {
      updateData.profileImage = newProfileImage;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error.message || error);

    return new Response(
      JSON.stringify({
        message: "Error updating user.",
        error: error.message || error,
      }),
      { status: 500 }
    );
  }
}
