
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

process.on("beforeExit", () => {
  db.$disconnect();
});

export { db };
