/// <reference types="vite/client" />
/**
 * Add typing of environment variables
 *
 * Docs: <https://vite.dev/guide/env-and-mode#intellisense-for-typescript>
 */

interface ImportMetaEnv {
	readonly VITE_SOCKET_HOST: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
