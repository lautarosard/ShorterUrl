import { Statistic } from '../entities/Statistic.js';

export interface IStatisticRepository {
  save(statistic: Statistic): Promise<void>;
  findByCode(code: string): Promise<Statistic | null>;
}
