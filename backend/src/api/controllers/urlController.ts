import type { Request, Response } from 'express';
import { UrlService } from '../../application/services/urlService.js';
import type { ShortenUrlRequest } from '../../application/models/requests/ShortenUrlRequest.js';

export class UrlController {
    
    constructor(private readonly urlService: UrlService) {}

    shorten = async (req: Request, res: Response): Promise<void> => {
        const body: ShortenUrlRequest = req.body;
        
        // Si usas un middleware de validación (Zod/Joi) antes, esto sobra.
        // Si no, validamos que exista la URL.
        if (!body.originalUrl) {
        res.status(400).json({ error: 'originalUrl is required' });
        return;
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
        res.status(404).json({ error: 'URL not found' });
        return;
        }

        res.redirect(302, originalUrl);
    };
}