import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { moods } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: req.session.user.email }, // ou req.session.user.id
    });

    // Supprime les anciens moods et ajoute les nouveaux
    await prisma.mood.deleteMany({
      where: { userId: user.id },
    });

    const newMoods = moods.map((mood) => ({
      name: mood,
      userId: user.id,
    }));

    await prisma.mood.createMany({
      data: newMoods,
    });

    res.status(200).json({ message: "Moods saved successfully" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
