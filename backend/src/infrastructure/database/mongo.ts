import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        // Busca la variable en .env, si no existe usa la local por defecto
        const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shortener';
        
        await mongoose.connect(dbUri);
        
        console.log('📦 MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1); // Aquí sí detenemos la app porque sin base de datos principal no funcionamos
    }
};