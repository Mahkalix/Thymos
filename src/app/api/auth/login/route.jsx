// app/api/login/route.js
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Utilisateur non trouvé." }),
        {
          status: 401,
        }
      );
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: "Mot de passe incorrect." }),
        {
          status: 401,
        }
      );
    }

    // Authentication successful
    return new Response(JSON.stringify({ message: "Connexion réussie !" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue." }),
      {
        status: 500,
      }
    );
  }
}
