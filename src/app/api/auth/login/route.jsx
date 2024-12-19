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
      return new Response(JSON.stringify({ message: "User not found." }), {
        status: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: "Wrong password." }), {
        status: 401,
      });
    }

    // Stocke user.id, email et password dans les cookies
    const res = NextResponse.json({ message: "Connexion réussie !" });
    const userId = user.id;
    console.log("User ID from database:", userId);

    res.cookies.set("id", userId, {
      httpOnly: true, // Empêche l'accès via JavaScript
      secure: process.env.NODE_ENV === "production", // Utiliser des cookies sécurisés en production
      sameSite: "strict", // Prévenir les attaques CSRF
      maxAge: 60 * 60 * 24, // Le cookie expire dans 1 jour
    });

    res.cookies.set("email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    res.cookies.set("password", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "An error has occurred." }), {
      status: 500,
    });
  }
}
