import mongoose, { Schema, Document } from 'mongoose';

// Definimos la estructura para Mongo
export interface UrlDocument extends Document {
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: Date;
}

const UrlSchema: Schema = new Schema({
    originalUrl: { type: String, required: true },
    shortCode:   { type: String, required: true, unique: true, index: true }, // Index es clave para velocidad
    clicks:      { type: Number, default: 0 },
    createdAt:   { type: Date, default: Date.now }
});

// "urls" será el nombre de la colección (equivalente a la tabla)
export const UrlModel = mongoose.model<UrlDocument>('urls', UrlSchema);