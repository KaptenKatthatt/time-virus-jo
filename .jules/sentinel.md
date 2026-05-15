## 2024-05-15 - [XSS] Missing HTML encoding on user-controlled names
**Vulnerability:** XSS vulnerability in multiple frontend components (`Livematches.ts`, `Scoreboard.ts`, `gameover.ts`, `PlayerCard.ts`, `main.ts`, etc.) where user-controlled player names are rendered directly into the DOM using `innerHTML` or `textContent` without escaping.
**Learning:** Whenever injecting user-controlled data into HTML using `.innerHTML` or template literals, it must be properly HTML escaped to prevent execution of arbitrary JavaScript. A utility function `escapeHtml` is present in `Chat.ts` but is not reused across the application.
**Prevention:** Extract the `escapeHtml` function into a shared utility (`utils/sanitize.ts` or similar) and apply it to all user-provided data rendered in HTML templates.
