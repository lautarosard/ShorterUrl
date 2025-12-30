import type { ShortenUrlRequest } from '../models/requests/ShortenUrlRequest.js';
import type { ShortenUrlResponse } from '../models/responses/ShortenUrlResponse.js';

export interface IUrlService {
  shortenUrl(request: ShortenUrlRequest): Promise<ShortenUrlResponse>;
  getOriginalUrl(shortCode: string, ip: string, userAgent?: string): Promise<string | null>;
}
