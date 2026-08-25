# RecoverAI — Revenue Recovery & Smart Dunning Engine

A local, deterministic demo for recovering failed payments with auditable routing, bounded retry policies, and human review for low-confidence cases.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Deploy to Vercel

Import this repository in Vercel. The Vite build is served from `dist`, while
the Express API is deployed through `api/[...path].ts`. Demo data is kept in
memory, so it may reset when a serverless instance is restarted.
