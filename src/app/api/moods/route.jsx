import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { moods, userId } = await req.json();

    // Validation des données d'entrée
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

    // Convertir userId en entier
    const userIdInt = parseInt(userId);

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
    });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Supprimer les anciennes humeurs associées à cet utilisateur
    await prisma.moodUser.deleteMany({
      where: { userId: userIdInt },
    });

    // Traiter chaque humeur et la lier à l'utilisateur
    const newMoods = await Promise.all(
      moods.map(async (moodName) => {
        // Vérifier si l'humeur existe déjà
        let mood = await prisma.mood.findFirst({
          where: { name: moodName },
        });

        // Si l'humeur n'existe pas, la créer
        if (!mood) {
          mood = await prisma.mood.create({
            data: { name: moodName },
          });
        }

        // Créer une nouvelle association dans MoodUser
        return await prisma.moodUser.create({
          data: {
            userId: userIdInt,
            moodId: mood.id,
          },
        });
      })
    );

    return new Response(
      JSON.stringify({ message: "Moods saved successfully", newMoods }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving moods:", error);
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
