import { Statistic } from '../entities/Statistic.ts';

export interface IStatisticRepository {
    save(statistic: Statistic): Promise<void>;
    findByCode(code: string): Promise<Statistic | null>;
    incrementClicks(code: string): Promise<void>;
}
