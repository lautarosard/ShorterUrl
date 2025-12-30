import type { Request, Response } from 'express';
import type { ShortenUrlRequest } from '../../application/models/requests/ShortenUrlRequest.js';
// Asegúrate de que el archivo se llame 'IUrlService.ts' (con mayúsculas)
import { AppError } from '../../application/models/errors/appError.js';
import type { IUrlService } from '../../application/interfaces/IurlService.js';
export class UrlController {

  constructor(private readonly urlService: IUrlService) { }

  shorten = async (req: Request, res: Response): Promise<void> => {
    const body: ShortenUrlRequest = req.body;

    // Validación básica
    if (!body.originalUrl) {
      throw new AppError('El campo originalUrl es obligatorio', 400);
    }

    const result = await this.urlService.shortenUrl(body);
    res.status(201).json(result);
  };

  redirect = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;

    if (!code) {
      throw new AppError('Code is required', 400);
    }

    // --- CORRECCIÓN PRINCIPAL ---
    // Ahora pasamos la IP y el User-Agent que pide el servicio
    const originalUrl = await this.urlService.getOriginalUrl(
      code,
      req.ip || req.socket.remoteAddress || 'unknown', // Intentamos obtener la IP
      req.headers['user-agent'] // Obtenemos el navegador/dispositivo
    );

    if (!originalUrl) {
      // Usamos 404 para "No encontrado" (es más semántico que 400)
      throw new AppError('URL not found', 404);
    }

    res.redirect(302, originalUrl);
  };
}
