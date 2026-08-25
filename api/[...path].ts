// Vercel maps this catch-all function to every /api/* request.
// The Express application remains the single source of API behavior.
import app from '../server';

export default app;
