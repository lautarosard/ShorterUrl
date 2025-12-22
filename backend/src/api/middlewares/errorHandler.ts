import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../application/errors/AppError.js'; // Ajusta la ruta si es necesario

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  
  // 1. Valores por defecto (Internal Server Error)
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // 2. Log para el desarrollador (tú)
  console.error('🔥 Error:', err);

  // 3. Manejo de errores específicos (Ej: MongoDB duplicado)
  // Si Mongo tira error de duplicado (código 11000), es un Bad Request (400) o Conflict (409)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Registro duplicado: El valor ya existe en el sistema.';
  }

  // 4. Respuesta al cliente
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // En producción no queremos mostrar el stack trace
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
