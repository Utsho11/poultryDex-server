/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import app from '../app';
import config from '../app/config';

dotenv.config({ path: path.join(process.cwd(), '.env') });

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const dbUrl =
    config.db_url ||
    process.env.MONGODB_URI ||
    'mongodb+srv://utsho_roy:utsho%401244@cluster0.2g6iibi.mongodb.net/poultrydex?appName=Cluster0';

  if (dbUrl) {
    await mongoose.connect(dbUrl as string);
    isConnected = true;
    console.log('🛢 MongoDB connected successfully for Vercel Serverless');
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel handler error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err?.message || err,
    });
  }
}
