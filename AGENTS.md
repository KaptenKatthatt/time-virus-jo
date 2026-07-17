# AGENTS.md - Project Instructions for AI Agents

## Rules for AI agents

### PR Creation Rules
- **Max 1 PR per issue/fix.** If a previous PR addressing the same problem exists, update it instead of creating a new one. Do NOT create duplicate PRs for the same fix.
- **Always check for existing open PRs** before creating a new one. If a similar PR exists, close it and create a single consolidated PR.
- **Keep PRs focused.** One concern per PR. Do not bundle unrelated changes.

### Security Rules (CRITICAL)
- **NEVER remove existing security validations.** This includes input checks, socket.id verification, auth guards, rate limiting, and sanitization.
- If you're optimizing code, keep all security checks in place. Performance improvements must not come at the cost of security.
- **Always add length limits** to string inputs (playerName, playerId, chat messages, etc.) when adding new input validation.

### Code Quality
- **Include tests** when adding new functionality or fixing bugs.
- **Keep changes minimal.** Small, focused diffs are easier to review and merge.

### PR Titles and Descriptions
- Use clear, descriptive titles. Avoid emoji spam.
- Describe what the change does and WHY, not just what.
- Reference any related issues.

### Review Process
- All PRs will be reviewed before merging.
- If a PR has merge conflicts, resolve them before requesting review.
- If a PR is closed without merging, do NOT recreate it without addressing the feedback.