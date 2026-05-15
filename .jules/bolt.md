## 2026-05-15 - In-Memory Scoreboard Caching
**Learning:** `getScoreboard` is called frequently whenever lobby state updates are broadcasted to all users, resulting in repetitive database queries for the top 10 played games. The TimeVirus backend currently uses a single Node.js instance architecture, making in-memory caching safe.
**Action:** Implemented a simple module-level `cachedScoreboard` variable in `updateScoreBoard.service.ts` to cache the latest scoreboard data and invalidate it upon new game completion, significantly reducing MongoDB read operations.
