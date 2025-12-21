import { nanoid } from 'nanoid';
import { Url } from '../../domain/entities/Url.js'; // Entidad del Dominio
import type { IUrlRepository } from '../../domain/Irepositories/iUrlRepository.js'; // Puerto
import type { ShortenUrlRequest} from '../models/requests/ShortenUrlRequest.js'; // DTOs
import type { ShortenUrlResponse } from '../models/responses/ShortenUrlResponse.js'; // DTOs
import type { UrlStatsResponse } from '../models/responses/UrlStatsResponse.js'; // DTOs
import redisClient from '../../infrastructure/database/redis.js'; // Infraestructura (Caché)

export class UrlService {
    
    // Inyectamos la dependencia del Repositorio (Inversión de Control)
    constructor(private readonly urlRepository: IUrlRepository) {}

    /**
     * Caso de Uso: Crear una nueva URL corta
     */
    async shortenUrl(request: ShortenUrlRequest): Promise<ShortenUrlResponse> {
        const { originalUrl, customAlias } = request;
        
        let shortCode: string;

        // --- LÓGICA DE ALIAS PERSONALIZADO ---
        if (customAlias) {
            // 1. Verificamos si el usuario mandó un alias
            // (Opcional: Aquí podrías validar que no tenga espacios ni caracteres raros)
            
            // 2. Verificamos si YA EXISTE en la base de datos
            const exists = await this.urlRepository.findByCode(customAlias);
            
            if (exists) {
                // Si ya existe, lanzamos un error (El middleware de error lo atrapará)
                const error: any = new Error('El alias personalizado ya está en uso ⛔');
                error.statusCode = 409; // 409 Conflict
                throw error;
            }

            shortCode = customAlias;
        } else {
            // 3. Si no mandó alias, generamos uno aleatorio como siempre
            shortCode = nanoid(6);
        }

        // 1. Generar ID único (NanoID es ideal para esto)
    
        // 2. Crear Entidad de Dominio
        const newUrl = new Url(originalUrl, shortCode);

        // 3. Persistir en Base de Datos (A través del Puerto)
        await this.urlRepository.save(newUrl);

        // 4. Guardar en Caché (Write-Through o actualización proactiva)
        // Expiración: 7 días (604800 segundos) para no llenar la RAM de Redis con basura vieja
        await redisClient.set(shortCode, originalUrl, { EX: 604800 });

        // 5. Mapear Entidad -> Response DTO
        return {
        shortCode: newUrl.shortCode,
        originalUrl: newUrl.originalUrl,
        createdAt: newUrl.createdAt
        };
    }

    /**
        * Caso de Uso: Obtener la URL original (para redirección)
        * Retorna string directo porque es lo único que necesitamos para el 'res.redirect'
    */
    async getOriginalUrl(shortCode: string): Promise<string | null> {
        
        // 1. ESTRATEGIA DE CACHÉ: Intentar leer de Redis primero (Rendimiento extremo)
        const cachedUrl = await redisClient.get(shortCode);
        
        if (cachedUrl) {
        // console.log(`⚡ Cache Hit para ${shortCode}`);
        return cachedUrl;
        }

        // 2. FALLBACK: Si no está en caché, ir a la Base de Datos (Lento)
        const urlEntity = await this.urlRepository.findByCode(shortCode);
        
        if (!urlEntity) return null;

        // 3. Lógica "Fire and Forget": Incrementar clicks sin esperar (para no bloquear la respuesta)
        // No usamos await aquí intencionalmente para responder más rápido al usuario
        this.urlRepository.incrementClicks(shortCode).catch(err => console.error(err));

        // 4. REPOBLAR CACHÉ: Guardar en Redis para la próxima petición
        await redisClient.set(shortCode, urlEntity.originalUrl, { EX: 604800 });

        return urlEntity.originalUrl;
    }
}
