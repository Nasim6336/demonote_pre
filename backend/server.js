

import express from 'express';
import cors from 'cors';

import path from 'path';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js'; 
import dotenv from "dotenv";
dotenv.config();
const app = express();
// Allow requests from your Vercel frontend
 
app.use(cors({
  origin: 'https://demonote-pre.vercel.app', // Your actual Vercel URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));



async function startServer() {
  
  const PORT = process.env.PORT || 4000;

  app.use(express.json());
  app.use(cookieParser());

  // Connect to MongoDB
  await connectDB();

  // If you want to be explicit, you can also add:
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/notes', noteRoutes);

  // Vite middleware for development
  // if (process.env.NODE_ENV !== "production") {
  //   const vite = await createViteServer({
  //     server: { middlewareMode: true },
  //     appType: "spa",
  //   });
  //   app.use(vite.middlewares);
  // } else {
  //   const distPath = path.join(process.cwd(), 'dist');
  //   app.use(express.static(distPath));
  //   app.get('*', (req, res) => {
  //     res.sendFile(path.join(distPath, 'index.html'));
  //   });
  // }

  app.listen(PORT,  () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
