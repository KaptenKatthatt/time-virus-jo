## 2025-05-14 - Missing Input Validation and XSS vulnerabilities
**Vulnerability:** XSS vulnerability and missing input validation on player name and chat messages.
**Learning:** The application received player names and chat messages without validating whether they were actually strings in the backend, leading to potential type errors and crashes. In the frontend, the `innerHTML` properties were used across various components (`Livematches`, `Scoreboard`, `PlayerCard`, `GameOver`) with unescaped user-controlled input.
**Prevention:** Always validate that incoming variables on the backend are strings using `typeof input === "string"` before operations like `.trim()` are performed. In the frontend, always encode outputs before using them with `.innerHTML`. A reusable `escapeHtml` utility was created in `frontend/src/utils/escapeHtml.ts` for this purpose.

## 2025-05-14 - Denial of Service in WebSocket Payload Parsing
**Vulnerability:** The application blindly destructured and assumed the presence of nested properties on payloads sent from WebSocket clients in various `socket.on` events.
**Learning:** Sending malicious or malformed `null` or structurally-invalid payloads like `socket.emit("chat:message", null)` triggered a `TypeError` (e.g., `TypeError: Cannot destructure property 'message' of 'object null'`) that could crash the entire backend process. Unchecked destructuring of user-provided data directly creates DoS risks in node servers.
**Prevention:** Always ensure payloads are checked to be objects (e.g., `typeof payload === "object" && payload !== null`) and validate the expected types of properties inside before destructuring or executing logic upon them.

## 2025-05-14 - IDOR Vulnerability via Socket.IO
**Vulnerability:** The application was vulnerable to Insecure Direct Object Reference (IDOR) because multiple Socket.IO event handlers trusted the `playerId` provided by the client in the event payload.
**Learning:** In a websocket setting, relying on client-provided identifiers for sensitive actions (like deleting a game or registering a player) allows attackers to impersonate other users simply by changing the ID in the payload. While the fix adds verification that the provided ID matches the socket ID, a more robust architectural pattern is to drop the payload parameter entirely and extract the trusted ID directly from `socket.id`.
**Prevention:** Never trust client-provided identifiers when the server already possesses the authenticated/trusted identifier (like `socket.id` or a session token).

## 2025-05-14 - Authorization Bypass in Game State
**Vulnerability:** The application trusted client-provided reaction times (`timestampPayload.timestamp`) and failed to enforce a single-click-per-round limit in the `player:clicked` socket.io event.
**Learning:** Clients could send a negative timestamp to artificially guarantee they are the fastest player. Additionally, because duplicate submissions weren't prevented, a malicious client could rapidly submit multiple click events in a row to rack up points for the same round, effectively bypassing the opponent's turn and cheating the game state.
**Prevention:** Always validate numeric inputs from clients (e.g., `reactionTime >= 0`) and strictly enforce state transitions or actions on the server (e.g., verify `clickedPlayers` array does not already contain the user before accepting another click event).
## 2025-05-14 - Overly permissive CORS configuration
**Vulnerability:** The application used wildcard CORS configuration ('origin: "*"' in Socket.io and 'app.use(cors())' without arguments in Express), which allowed any website to make cross-origin requests to the API and WebSocket server.
**Learning:** Default CORS configurations are often overly permissive. While useful during initial development, they expose the application to CSRF-like attacks and unauthorized data access in production environments.
**Prevention:** Always restrict CORS origins to explicitly allowed domains using environment variables (e.g., 'process.env.CORS_ORIGIN'). When allowing credentials, a specific origin must be provided instead of a wildcard.

## 2025-05-14 - Information Disclosure in Error Responses
**Vulnerability:** The Express 404 fallback handler exposed the absolute file path of the server's directory structure to clients.
**Learning:** Returning detailed internal server paths (`frontendDistPathResolved`) in HTTP responses (like a 404 handler) can provide attackers with information about the underlying system architecture, facilitating further targeted attacks.
**Prevention:** Always use generic error messages (e.g., "Frontend build not found") for client-facing errors and avoid leaking internal file paths or stack traces.
