import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// 1. Definimos el cliente con su tipo explícito para evitar el error de inferencia
const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('⚡ Redis Client Connected'));

// 2. Función para iniciar la conexión
export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Could not connect to Redis:', error);
        // No matamos el proceso (process.exit) porque la app podría funcionar solo con Mongo (aunque más lento)
    }
};

export default redisClient;