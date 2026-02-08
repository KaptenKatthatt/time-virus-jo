import "dotenv/config";
import { PrismaClient } from "./../../generated/prisma/client.ts";

const prisma = new PrismaClient({
	// log: ["error", "info", "query", "warn"],  // ONLY ACTIVATE WHEN DEBUGGING (and probably only the "query" level)
});

export { prisma };
