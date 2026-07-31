# ECHO DEV - AI-Powered Web App Builder

## Description
ECHO DEV is a full-stack AI-powered web application builder that generates complete, production-ready HTML/CSS/JavaScript apps from plain English prompts.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express 5
- **Database**: MongoDB Atlas (Mongoose)
- **AI Engine**: Featherless AI / Gemini / xAI Grok (configurable)

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/dharanivavilla28/echo-hack.git
cd echo-hack
```

### 2. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment
```bash
cp server/.env.example server/.env
```
Fill in your real keys in `server/.env`:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT auth (min 32 chars) |
| `FEATHERLESS_API_KEY` | API key from https://featherless.ai/account/api-keys |
| `FEATHERLESS_MODEL` | Model name e.g. `Qwen/Qwen2.5-Coder-32B-Instruct` |
| `GEMINI_API_KEY` | Google Gemini API key (fallback) |
| `XAI_API_KEY` | xAI Grok API key (fallback) |

### 4. Run the app
```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## AI Provider Priority
The app automatically selects the AI provider in this order:
1. **Featherless AI** (if `FEATHERLESS_API_KEY` is set)
2. **Google Gemini** (if `GEMINI_API_KEY` is set)
3. **xAI Grok** (if `XAI_API_KEY` is set)

## Features
- 🤖 AI-powered web app generation from plain English prompts
- 💬 Multi-turn conversation for iterative refinement
- 🔴 Live HTML/CSS/JS preview (iframe)
- ✏️ Editable code view with real-time preview sync
- 💾 Auto-save with status indicator
- 🔐 JWT-based authentication (signup / login)
- ☁️ All projects and users stored in MongoDB Atlas
- 📥 Download generated code as .html file
