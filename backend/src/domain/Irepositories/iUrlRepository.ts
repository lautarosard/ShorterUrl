import { Url } from '../entities/Url.js';

export interface IUrlRepository {
  save(url: Url): Promise<void>;
  findByCode(code: string): Promise<Url | null>;
}
