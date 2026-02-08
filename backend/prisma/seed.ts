import { prisma } from "../src/lib/prisma.ts";

const main = async () => {
	// 🌱 Here be all your seeds 🍼👶🏻...

}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (err) => {
		console.error(err);
		await prisma.$disconnect();
		process.exit(1);
	});
