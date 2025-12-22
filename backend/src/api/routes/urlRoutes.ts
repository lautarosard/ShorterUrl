import { Router } from 'express';
import { UrlController } from '../controllers/urlController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js'; // <--- Importar

export const createUrlRouter = (urlController: UrlController): Router => {
    const router = Router();

    // Envolvemos con asyncHandler
    router.post('/shorten', asyncHandler(urlController.shorten));
    router.get('/:code', asyncHandler(urlController.redirect));

    return router;
};
