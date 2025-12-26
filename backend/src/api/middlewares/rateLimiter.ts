import type { Request, Response, NextFunction } from 'express';
import redisClient from '../../infrastructure/database/redis.js';
// Importamos tu cliente ya conectado
import { AppError } from '../../application/models/errors/appError.js';
// Usamos tu error personalizado

// Configuración: 10 peticiones cada 60 segundos
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS = 10;
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. OBTENER IDENTIFICADOR (IP)
    // Express te da la IP en req.ip
    const ip = req.ip;

    // Clave única para Redis (ej: "rate_limit:127.0.0.1")
    const key = `rate_limit:${ip}`;

    // 2. INCREMENTAR CONTADOR EN REDIS
    // Pista: Busca en la doc de node-redis el método .incr(key)
    const requestCount = await redisClient.incr(key);

    // 3. SI ES LA PRIMERA VEZ (requestCount === 1)
    //    Configurar la expiración para que el contador se resetee solo.
    //    Pista: Busca el método .expire(key, segundos)
    if (requestCount === 1) { 
      await redisClient.expire(key, WINDOW_SIZE_IN_SECONDS);

    }

    // 4. VERIFICAR LÍMITE
    // Si requestCount es mayor a MAX_REQUESTS...
    //    Lanzamos un error 429
    //    throw new AppError('Too many requests, please try again later.', 429);
    if(requestCount>MAX_REQUESTS ){
      const ttl=await redisClient.ttl(key);
      throw new AppError('Too many requests, please try again '+'in '+ ttl+'s', 429);
    }
    // 5. DEJAR PASAR
    // Si no superó el límite, dejamos que siga al controller
    next();

  } catch (error) {
    // Si hay error (ej: se cayó Redis), mejor dejamos pasar al usuario (Fail Open)
    // o llamamos a next(error) para que lo maneje el errorHandler.
    // Para este ejercicio, pasemos el error al handler global.
    next(error);
  }
};
