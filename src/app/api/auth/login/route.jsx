// app/api/login/route.js
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

  try {
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: "Mot de passe incorrect." }),
        {
          status: 401,
        }
      );
    }

    //stocke user.id dans cookies

    const res = NextResponse.json({ message: "Connexion réussie !" });
    const userId = user.id;
    console.log("User ID from database:", userId);

    res.cookies.set("id", userId, {
      httpOnly: true, // Empêche l'accès via JavaScript
      secure: process.env.NODE_ENV === "production", // Utiliser des cookies sécurisés en production
      sameSite: "strict", // Prévenir les attaques CSRF
      maxAge: 60 * 60 * 24, // Le cookie expire dans 1 jour
    });

    return res;
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
