import express, { type Application } from 'express';
import cors from 'cors';
import { errorHandler } from './api/middlewares/errorHandler.js';
// Ya no importamos 'urlRoutes' directamente aquí.
// Recibimos el router como dependencia.
export const createApp = (urlRouter: express.Router): Application => {
  const app: Application = express();

  app.use(cors());
  app.use(express.json());

  // Montamos las rutas que nos pasaron por parámetro
  app.use('/api/url', urlRouter);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Shortener API is running' });
  });
  app.use(errorHandler);

  return app;
};
