import type { IUrlRepository } from '../../domain/Irepositories/iUrlRepository.js';
import { Url } from '../../domain/entities/Url.js';
import { UrlModel } from '../database/schemas/urlSchema.js';

export class MongoUrlRepository implements IUrlRepository {

    async save(url: Url): Promise<void> {
        // Mongoose: Creamos una instancia del modelo y guardamos
        const newUrl = new UrlModel(url); 
        await newUrl.save();
    }

    async findByCode(code: string): Promise<Url | null> {
        // Mongoose: findOne es equivalente a SELECT * FROM urls WHERE shortCode = code LIMIT 1
        const doc = await UrlModel.findOne({ shortCode: code });
        
        if (!doc) return null;

        // Convertimos el documento de Mongo a nuestra entidad de Dominio limpia
        return new Url(doc.originalUrl, doc.shortCode, doc.clicks, doc.createdAt);
    }

    async incrementClicks(code: string): Promise<void> {
        // Esto en SQL sería un UPDATE urls SET clicks = clicks + 1 WHERE...
        await UrlModel.updateOne({ shortCode: code }, { $inc: { clicks: 1 } });
    }
}