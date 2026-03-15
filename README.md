# 🦠 TimeVirus 🎮

Welcome to **TimeVirus**, a real-time multiplayer game where players race against time, kill viruses, and compete for the top score.

This project began as a **group project** in our API course at **Medieinstitutet**.
From **15 March 2026** and onward, it has continued as a **personal project** built solely by me.

## 🎯 Features

- Real-time multiplayer gameplay with Socket.IO
- Live lobby with match state updates
- Round-based game flow and score tracking
- In-game timer and game-over flow
- Shared event types between frontend and backend
- Persistent game/player data in MongoDB

## 🕹️ Gameplay

- Players join a shared lobby and wait for the round to begin.
- Each round is time-limited, and players score by surviving and making fast decisions.
- Virus events and player actions are synchronized in real time through Socket.IO.
- When the timer ends, the match transitions to game-over and the scoreboard updates live.

## 🧩 Tech Stack

- **Frontend:** Vanilla TypeScript, Vite, SCSS
- **Backend:** Node.js, TypeScript, Express, Socket.IO
- **Database:** MongoDB
- **ORM/DB layer:** Prisma
- **Linting & Quality:** ESLint, TypeScript type-checking, type-coverage

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB connection string for backend `.env`

### Installation

Install root, backend, and frontend dependencies:

```bash
npm install
```

### Configuration

Create environment files:

- Copy `frontend/.env.example` to `frontend/.env`
- Copy `backend/.env.example` to `backend/.env`

Optional backend cleanup tuning for stale players/games:

- `RECONCILE_INTERVAL_MS` (default `30000`)
- `STALE_GRACE_PERIOD_MS` (default `45000`)

### Run in development

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

## 🛠️ Available Scripts

### Root

- `npm install` — Install backend and frontend dependencies
- `npm run build` — Build frontend and backend
- `npm start` — Seed DB and start backend in production mode

### Backend (`backend/`)

- `npm run dev` — Start backend in watch mode
- `npm run debug` — Start backend with extended debug logging
- `npm run build` — Generate Prisma client and compile backend
- `npm run check` — Run lint, typecheck, and type-coverage
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript checks without emit

### Frontend (`frontend/`)

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check and build frontend
- `npm run preview` — Preview production build
- `npm run check` — Run lint, typecheck, and type-coverage
- `npm run lint` — Run ESLint

## 📁 Project Structure

```text
backend/
	src/
		controllers/   Socket event controllers
		services/      Game, player, virus, score logic
		lib/           Prisma + shared backend utilities
		config/        Environment loading
	prisma/
		schema.prisma  Prisma schema (MongoDB)

frontend/
	src/
		components/    UI components (lobby/game/chat/scoreboard)
		pages/         lobby, game, gameover views
		assets/scss/   SCSS partials and styles
		types/         Frontend event/data types

shared/
	constants/       Shared constants
	types/           Shared payload and socket event types
```

## 🧠 Project Background

- Started as a collaborative school project in an API course at Medieinstitutet
- Continued as a solo-maintained project from 15 March 2026
- Focused on real-time architecture, clean event contracts, and game-state reliability

## 🔮 Future Improvements

- Advanced matchmaking (skill-based and latency-aware pairing)
- Reconnect support so disconnected players can return to ongoing matches
- Persistent ranked leaderboard with seasonal statistics
- Expanded automated testing for realtime Socket.IO flows and race conditions

## 🤝 Original Group Members

- [GrimSpook](https://github.com/GrimSpook)
- [let-sandystar](https://github.com/let-sandystar)

## 📜 License

This project is for educational and portfolio purposes.
