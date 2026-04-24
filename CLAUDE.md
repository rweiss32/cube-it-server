# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vercel serverless backend for the "Cube It" word game. It exposes a single API endpoint that uses Google's Gemini AI to determine whether a given Hebrew word belongs to a given category.

## Deployment

The project is deployed on Vercel (project: `cube-it-server`). There are no build steps — Vercel picks up `api/check.js` automatically as a serverless function at `/api/check`.

To deploy: `npx vercel --prod`

## Environment Variables

`GOOGLE_API_KEY` — Google AI Studio API key, must be set in Vercel project settings (not in code or `.env` checked in).

`RESEND_API_KEY` — Resend API key for sending feedback emails. Must be set in Vercel project settings.

## API: `POST /api/check`

**Request body (JSON):**
```json
{ "word": "כלב", "category": "בעלי חיים" }
```

**Response:**
```json
{ "answer": "כן" }
```

The handler calls Gemini (`gemma-4-26b-a4b-it`) with a Hebrew prompt and returns `"כן"` (yes) or `"לא"` (no). `temperature: 0` and `maxOutputTokens: 2` keep responses deterministic and minimal. The raw model output is stripped of punctuation before being returned.

CORS is set to `*` to allow access from the GitHub Pages frontend.

## API: `POST /api/feedback`

**Request body (JSON):**
```json
{
  "type": "bug|feature|feedback",
  "subject": "...",
  "description": "...",
  "gameState": { ... },
  "screenshot": "data:image/jpeg;base64,..."
}
```

`gameState` and `screenshot` are optional. Sends an HTML email to `raviv.weiss@gmail.com` via Resend.

## Architecture

```
api/
  check.js     — AI word validation (Google Gemini)
  feedback.js  — feedback email sender (Resend)
```

No framework (Express, etc.) is used — the handler follows Vercel's Node.js serverless function signature (`(req, res)`). The file uses `export default` (ESM) but `require()` for the Google AI SDK — Vercel handles the mixed module style.
