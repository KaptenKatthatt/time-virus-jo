## 2025-05-18 - [Unnecessary DB Call Due to Overwritten Property in Socket Updates]
**Learning:** In `backend/src/controllers/socket.controller.ts`, `buildLobbyUpdate` queried `getAllPlayers()` from the database just to assign it to `onlinePlayers`. However, its wrapper `buildLobbyUpdateForIo` immediately overwrote `onlinePlayers` with a fresh list obtained from `io.fetchSockets()`. This resulted in a redundant database query being executed on *every* lobby update operation.
**Action:** Always verify if a returned database property is actually consumed by the caller, especially when working with wrapper functions that inject real-time or augmented state into the base payloads.

## 2025-05-26 - [Trusting In-Memory State over Sync DB Validation]
**Learning:** In a single-instance Node.js architecture with live game state managed in memory, we had a `findExistingGameIds` database query running synchronously during *every* lobby update broadcast just to validate active games. However, we already have an asynchronous reconcile loop (`startReconcileCleanup`) specifically built to sync and clean up orphaned state.
**Action:** Trust the memory-synced state in single-instance apps where a reconcile loop is present. Do not incur synchronous database overhead on high-frequency payloads just to double-check state that is already being eventually handled by a cleanup job.
