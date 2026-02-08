import cors from "cors";
import express from "express";
import fs from "node:fs";
import morgan from "morgan";
import path from "node:path";

// Detect environment
const NODE_ENV = process.env.NODE_ENV || "development";
console.log("🌱 Environment:", NODE_ENV);

// Current path
const currentPath = path.dirname(".");
console.log("📂 Current path:", path.resolve(currentPath));

// Path to frontend build
const frontendDistPath = path.join(path.dirname("."), NODE_ENV === "production"
	? "../frontend/dist"
	: "../frontend/dist"
);
const frontendDistPathResolved = path.resolve(frontendDistPath);
console.log("📂 Frontend dist path (unresolved):", frontendDistPath);
console.log("🗺️ Frontend dist path:", frontendDistPathResolved);

// Fire up a new express application
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Check if frontend build exists
if (fs.existsSync(frontendDistPathResolved)) {
	console.log("🚚 Path to frontend build exists ✅");
	// Serve frontend
	app.use(express.static(frontendDistPathResolved));
} else {
	console.warn("⚠️ Path to frontend build does not exist:", frontendDistPathResolved);

	// Catch-all route handler with message about missing frontend build
	app.use((_req, res) => {
		// Respond with 404 and a message in JSON-format
		res.status(404).send(`Frontend build does not exist at ${frontendDistPathResolved}`);
	});
}

export default app;
