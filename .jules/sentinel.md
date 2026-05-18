## 2025-05-14 - Missing Input Validation and XSS vulnerabilities
**Vulnerability:** XSS vulnerability and missing input validation on player name and chat messages.
**Learning:** The application received player names and chat messages without validating whether they were actually strings in the backend, leading to potential type errors and crashes. In the frontend, the `innerHTML` properties were used across various components (`Livematches`, `Scoreboard`, `PlayerCard`, `GameOver`) with unescaped user-controlled input.
**Prevention:** Always validate that incoming variables on the backend are strings using `typeof input === "string"` before operations like `.trim()` are performed. In the frontend, always encode outputs before using them with `.innerHTML`. A reusable `escapeHtml` utility was created in `frontend/src/utils/escapeHtml.ts` for this purpose.

## 2025-05-14 - Denial of Service in WebSocket Payload Parsing
**Vulnerability:** The application blindly destructured and assumed the presence of nested properties on payloads sent from WebSocket clients in various `socket.on` events.
**Learning:** Sending malicious or malformed `null` or structurally-invalid payloads like `socket.emit("chat:message", null)` triggered a `TypeError` (e.g., `TypeError: Cannot destructure property 'message' of 'object null'`) that could crash the entire backend process. Unchecked destructuring of user-provided data directly creates DoS risks in node servers.
**Prevention:** Always ensure payloads are checked to be objects (e.g., `typeof payload === "object" && payload !== null`) and validate the expected types of properties inside before destructuring or executing logic upon them.
