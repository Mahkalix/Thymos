// src/lib/prisma.jsx
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

if (typeof global !== "undefined") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = prismaClientSingleton();
  }
}

export const prisma = global.prismaGlobal || prismaClientSingleton();
