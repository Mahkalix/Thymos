import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { moods, userId } = await req.json();

    if (!moods || !Array.isArray(moods) || moods.length === 0) {
      return new Response(JSON.stringify({ message: "Moods are required" }), {
        status: 400,
      });
    }
    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), {
        status: 400,
      });
    }

    const userIdInt = parseInt(userId);

    // Supprimer les anciennes humeurs associées à cet utilisateur
    await prisma.moodUser.deleteMany({
      where: { userId: userIdInt },
    });

    const moodName = moods[0]; // Extraire le premier élément car il n'y a qu'un mood
    let mood = await prisma.mood.findFirst({
      where: { name: moodName },
    });

    if (!mood) {
      mood = await prisma.mood.create({ data: { name: moodName } });
    }

    await prisma.moodUser.create({
      data: {
        userId: userIdInt,
        moodId: mood.id,
      },
    });

    return new Response(
      JSON.stringify({ message: "Mood saved successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving mood:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), {
        status: 400,
      });
    }

    const moods = await prisma.moodUser.findMany({
      where: { userId: parseInt(userId) },
      include: { mood: true },
    });

    // Extraire uniquement les noms des humeurs
    const moodNames = moods.map((entry) => entry.mood.name);

    return new Response(JSON.stringify(moodNames), { status: 200 });
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
