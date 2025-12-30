import type { Request, Response } from 'express';
import type { ShortenUrlRequest } from '../../application/models/requests/ShortenUrlRequest.js';
import type { IUrlService } from '../../application/interfaces/IurlService.js';
import { AppError } from '../../application/models/errors/appError.js';
export class UrlController {

  constructor(private readonly urlService: IUrlService) { }

  shorten = async (req: Request, res: Response): Promise<void> => {
    const body: ShortenUrlRequest = req.body;

    // Si usas un middleware de validación (Zod/Joi) antes, esto sobra.
    // Si no, validamos que exista la URL.
    if (!body.originalUrl) {
      throw new AppError('El campo originalUrl es obligatorio', 400);
    }

    const result = await this.urlService.shortenUrl(body);
    res.status(201).json(result);
  };

  redirect = async (req: Request, res: Response): Promise<void> => {
    // CORRECCIÓN 1: Extraemos code
    const { code } = req.params;

    // CORRECCIÓN 2: Validamos explícitamente. 
    // Si 'code' es undefined, cortamos aquí. TypeScript ahora sabrá que abajo es string.
    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const originalUrl = await this.urlService.getOriginalUrl(code);

    if (!originalUrl) {
      throw new AppError('url not found', 400);
    }

    res.redirect(302, originalUrl);
  };
}
