import type { Request, Response, NextFunction } from 'express';

// Tipo para funciones asíncronas de Express
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ejecuta la función y pasa cualquier error a next()
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
