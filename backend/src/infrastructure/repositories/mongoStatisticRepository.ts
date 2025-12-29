import type { iStatisticRepository } from '../../domain/Irepositories/iStatisticRepository.js';; 
import {Statistic} from '../../domain/entities/Statistic.js';
import {StatisticModel} from '../database/schemas/statisticSchema.js';
export class MongoUrlRepository implements  iStatisticRepository {

    async save(statistic: Statistic): Promise<void> {
        // Mongoose: Creamos una instancia del modelo y guardamos
        const newStatistic = new StatisticModel(statistic); 
        await newStatistic.save();
    }

    async findByCode(code: string): Promise<Statistic | null> {
        // Mongoose: findOne es equivalente a SELECT * FROM urls WHERE shortCode = code LIMIT 1
        const doc = await StatisticModel.findOne({ urlCode: code });
        
        if (!doc) return null;

        // Convertimos el documento de Mongo a nuestra entidad de Dominio limpia
        return new Statistic(doc.urlCode, doc.ip, doc.userAgent,doc.createdAt);
    }

    async incrementClicks(code: string): Promise<void> {
        // Esto en SQL sería un UPDATE urls SET clicks = clicks + 1 WHERE...
        await StatisticModel.updateOne({ urlCode: code }, { $inc: { clicks: 1 } });
    }
}
