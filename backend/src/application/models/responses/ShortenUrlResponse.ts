export interface ShortenUrlResponse {
    shortCode: string;
    originalUrl: string;
    createdAt: Date;
    // No devolvemos 'clicks' aquí porque al crear es siempre 0
}