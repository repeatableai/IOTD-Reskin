import express from 'express';
import { registerRoutes } from '../dist/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
await registerRoutes(app);

export default app;
