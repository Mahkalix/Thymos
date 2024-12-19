import { getCookie } from "cookies-next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Methode get retourne les informations de l'utilisateur
export async function GET(req) {
  const userId = getCookie("id", { req });
  const email = getCookie("email", { req });
  const password = getCookie("password", { req });
  const profileImage = getCookie("profileImage", { req });

  console.log("ID from cookie:", userId);
  console.log("Email from cookie:", email);
  console.log("Mot de passe from cookie:", password);
  console.log("Profile image from cookie:", profileImage);

  if (!userId && !email && !password && !profileImage) {
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
    JSON.stringify({
      id: userId,
      email: email,
      password: password,
      profileImage: profileImage,
    }),
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
    await prisma.moodUser.deleteMany({
      where: { userId: userId }, // Delete related entries in MoodUser table
    });

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
    if (newProfileImage) {
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
