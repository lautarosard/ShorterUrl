import dotenv from 'dotenv';
import { connectDB } from './infrastructure/database/mongo.js';
import { connectRedis } from './infrastructure/database/redis.js';

// Importamos las clases (pero no las instancias)
import { MongoUrlRepository } from './infrastructure/repositories/mongoUrlRepository.js';
import { UrlService } from './application/services/urlService.js';
import { UrlController } from './api/controllers/urlController.js';

// Importamos las fábricas
import { createUrlRouter } from './api/routes/urlRoutes.js';
import { createApp } from './app.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    // 1. Infraestructura (Bases de Datos)
    await connectDB();
    await connectRedis();

    // 2. WIRING (Inyección de Dependencias Manual - Tu estilo)
    // ------------------------------------------------------
    const urlRepository = new MongoUrlRepository();
    const urlService = new UrlService(urlRepository); // Inyectamos Repo
    const urlController = new UrlController(urlService); // Inyectamos Service
    
    // 3. Creación de Rutas
    const urlRouter = createUrlRouter(urlController); // Inyectamos Controller

    // 4. Creación de la App
    const app = createApp(urlRouter); // Inyectamos Router a la App

    // 5. Encendido
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();