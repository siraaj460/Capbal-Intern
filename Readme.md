# How to Run This Project Locally

## Prerequisites
- Node.js v18+ installed → https://nodejs.org
- npm (comes with Node.js)

## Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example env file:
```bash
cp .env.example .env
```
Then open `.env` and fill in your Mine ID from your Base44 dashboard.

### 3. Run the Development Server
```bash
npm run dev
```
Open your browser at: http://localhost:5173

### 4. Build for Production
```bash
npm run build
```

## Project Structure
- `src/pages/` — Main pages (Dashboard, Library, Flashcards, Quiz, Analytics, VoiceQA)
- `src/components/` — Reusable UI components
- `src/lib/` — Utilities, auth, AI helpers
- `entites/` — SQL schema files for the database entities

## Tech Stack
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- TanStack Query
- Base44 SDK (backend/auth)
