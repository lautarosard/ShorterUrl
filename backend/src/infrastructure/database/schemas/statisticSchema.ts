import mongoose, { Schema, Document } from 'mongoose';

// Definimos la estructura para Mongo
export interface StatisticDocument extends Document {
    urlCode: string;
    ip: string;
    userAgent: string;
    createdAt: Date;
}

const StatisticSchema: Schema = new Schema({
    urlCode: { type: String, required: true },
    ip:   { type: String, required: true, index: true }, // Index es clave para velocidad
    userAgent:      { type: string, required:false },
    createdAt:   { type: Date, default: Date.now }
});

// "urls" será el nombre de la colección (equivalente a la tabla)
export const StatisticModel = mongoose.model<StatisticDocument>('statistics', StatisticSchema);
