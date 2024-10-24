import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Utilisateur déjà existant." }),
        {
          status: 409,
        }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Registration successful
    return new Response(JSON.stringify({ message: "Inscription réussie !" }), {
      status: 201,
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
