## 2025-05-18 - [Unnecessary DB Call Due to Overwritten Property in Socket Updates]
**Learning:** In `backend/src/controllers/socket.controller.ts`, `buildLobbyUpdate` queried `getAllPlayers()` from the database just to assign it to `onlinePlayers`. However, its wrapper `buildLobbyUpdateForIo` immediately overwrote `onlinePlayers` with a fresh list obtained from `io.fetchSockets()`. This resulted in a redundant database query being executed on *every* lobby update operation.
**Action:** Always verify if a returned database property is actually consumed by the caller, especially when working with wrapper functions that inject real-time or augmented state into the base payloads.

## 2026-05-28 - [O(N²) Array Deduplication in Rendering Methods]
**Learning:** In frontend components like `Chat.ts`, array deduplication using `filter` combined with `findIndex` (`arr.findIndex(x => x.id === p.id) === i`) results in O(N²) time complexity. When these methods are called frequently (e.g., on every socket lobby update) and scale with the user base, they can significantly block the main thread and degrade rendering performance.
**Action:** Always replace O(N²) nested array lookups with O(N) hash map or `Set` lookups when processing lists that update frequently or can grow unboundedly.
