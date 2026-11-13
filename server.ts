import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './src/db/db.js';
import { seedDemoData } from './src/db/seed.js';

import authRoutes from './src/routes/authRoutes.js';
import readingRoutes from './src/routes/readingRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB and Seed on startup
initDB().then(() => {
  seedDemoData();
}).catch(err => {
  console.error('Failed to initialize database on startup:', err);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', reportRoutes); // stats is also accessible via reportRoutes / stats route

// Vite middleware / static serving for frontend SPA
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false }
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Sweety Server running on port ${PORT}`);
});
