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

    // Stocke uniquement les données nécessaires
    const res = NextResponse.json({ message: "Connexion réussie !" });
    res.cookies.set("id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    res.cookies.set("email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    res.cookies.set("profileImage", user.profileImage, {
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
