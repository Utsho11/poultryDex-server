/* eslint-disable @typescript-eslint/no-unused-vars */
import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import routes from './app/routes';

const app: Application = express();

// Permissive CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://poultrydex.vercel.app',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Dev flexibility fallback
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Welcome to the PoultryDex API',
    status: 'online',
    version: '2.0.0',
  });
});

// Mount routes under both /api and /api/v1 for complete compatibility
app.use('/api', routes);
app.use('/api/v1', routes);

// Handle 404 Not Found
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
