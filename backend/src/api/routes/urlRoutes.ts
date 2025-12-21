import { Router } from 'express';
import { UrlController } from '../controllers/urlController.js';

// Recibimos el controlador ya instanciado (Inversión de Control real)
export const createUrlRouter = (urlController: UrlController): Router => {
    const router = Router();
    router.post('/shorten', urlController.shorten.bind(urlController));
    router.get('/:code', urlController.redirect.bind(urlController));
    return router;
};
