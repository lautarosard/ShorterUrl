import { nanoid } from 'nanoid';
import { Url } from '../../domain/entities/Url.js';
import type { IUrlRepository } from '../../domain/Irepositories/iUrlRepository.js';
import type { ShortenUrlRequest } from '../models/requests/ShortenUrlRequest.js';
import type { ShortenUrlResponse } from '../models/responses/ShortenUrlResponse.js';
import redisClient from '../../infrastructure/database/redis.js';
import { AppError } from '../models/errors/appError.js';
import type { IStatisticRepository } from '../../domain/Irepositories/iStatisticRepository.js';
import type { IUrlService } from '../interfaces/IurlService.js'; // Ojo con mayúsculas/minúsculas en el nombre del archivo
import { Statistic } from "../../domain/entities/Statistic.js";

export class UrlService implements IUrlService {

  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly statisticRepository: IStatisticRepository
  ) { }

  /**
   * Caso de Uso: Crear una nueva URL corta
   */
  async shortenUrl(request: ShortenUrlRequest): Promise<ShortenUrlResponse> {
    const { originalUrl, customAlias } = request;

    let shortCode: string;

    // --- LÓGICA DE ALIAS PERSONALIZADO ---
    if (customAlias) {
      // 1. Verificamos si YA EXISTE en la base de datos
      const exists = await this.urlRepository.findByCode(customAlias);
      if (exists) {
        throw new AppError('El alias personalizado ya está en uso ⛔', 409);
      }

      shortCode = customAlias;
    } else {
      // 2. Si no mandó alias, generamos uno aleatorio
      shortCode = nanoid(6);
    }

    // 3. Crear Entidad de Dominio
    const newUrl = new Url(originalUrl, shortCode);

    // 4. Persistir en Base de Datos
    await this.urlRepository.save(newUrl);

    // 5. Guardar en Caché (7 días)
    await redisClient.set(shortCode, originalUrl, { EX: 604800 });

    return {
      shortCode: newUrl.shortCode,
      originalUrl: newUrl.originalUrl,
      createdAt: newUrl.createdAt
    };
  }

  /**
   * Caso de Uso: Obtener la URL original (para redirección)
   * AHORA RECIBE IP Y USER AGENT
   */
  async getOriginalUrl(shortCode: string, ip: string, userAgent?: string): Promise<string | null> {

    // 1. Caché
    const cachedUrl = await redisClient.get(shortCode);
    if (cachedUrl) {
      // Registramos visita aunque sea caché (Fire & Forget)
      this.logVisit(shortCode, ip, userAgent);
      return cachedUrl;
    }

    // 2. Base de Datos
    const urlEntity = await this.urlRepository.findByCode(shortCode);
    if (!urlEntity) return null;

    // 3. Registrar "Hits"
    // A. Contador simple (Legacy)
    this.urlRepository.incrementClicks(shortCode).catch(console.error);

    // B. Log detallado (Nuevo)
    this.logVisit(shortCode, ip, userAgent);

    // 4. Repoblar Caché
    await redisClient.set(shortCode, urlEntity.originalUrl, { EX: 604800 });

    return urlEntity.originalUrl;
  }

  // Método privado auxiliar
  private async logVisit(code: string, ip: string, userAgent?: string): Promise<void> {
    try {
      // Si userAgent es undefined, enviamos 'unknown' o lo dejamos pasar si la entidad lo permite
      const visit = new Statistic(code, ip, userAgent || 'unknown');
      await this.statisticRepository.save(visit);
    } catch (error) {
      console.error('Error saving statistic:', error);
    }
  }
}
