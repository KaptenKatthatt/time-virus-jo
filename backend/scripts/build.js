import { build } from "esbuild";

await build({
	entryPoints: ["src/server.ts"],
	outfile: "dist/server.js",
	bundle: true,
	platform: "node",
	format: "esm",
	target: "node25",
	sourcemap: true,

	// Key: external npm-packages (incl. express/prisma/native deps)
	packages: "external"
});
