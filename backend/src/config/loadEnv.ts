import fs from "node:fs";
import dotenv from "dotenv";

function applyEnv(parsed: Record<string, string>) {
	for (const [key, value] of Object.entries(parsed)) {
		// CLI / existing env always wins if it isn't undefined or empty
		if (process.env[key] === undefined || process.env[key] === "") {
			console.log(`🌱 ${key}=${value}`);
			process.env[key] = value;
		}
	}
}

function loadEnv(mode: string) {
	const files = [
		`.env.${mode}.local`,
		`.env.${mode}`,
		".env.local",
		".env",
	];

	for (const file of files) {
		if (!fs.existsSync(file)) continue;
		console.log("🌱 Loading environment variables from", file);

		const result = dotenv.config({ path: file, override: false });
		if (result.parsed) {
			applyEnv(result.parsed);
		}
	}

	// 🚛🌱
	// console.log("🌱 All environment variables:", process.env);
}

// Default to "development" if no NODE_ENV is set
const mode = process.env.NODE_ENV ?? "development";

// Initialize dotenv so it reads our `.env`-file
loadEnv(mode);
