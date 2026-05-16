## 2023-10-27 - In-memory Caching in Single-Instance Architecture
**Learning:** The backend maintains state (like `activeGames`) in memory, which indicates a single-instance architecture. This allows for simple, effective in-memory caching (like caching DB query results for the lobby scoreboard) without needing to worry about distributed caching or synchronization issues.
**Action:** When frequently querying relatively static data (e.g. recent scoreboards) that is updated in the same instance, use a simple in-memory cache variable instead of hitting the DB on every event.
