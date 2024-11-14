// app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const res = NextResponse.json({ message: "Déconnexion réussie !" });

  // Supprimer le cookie d'authentification
  res.cookies.delete("session");
  res.cookies.delete("id");

  return res;
}
