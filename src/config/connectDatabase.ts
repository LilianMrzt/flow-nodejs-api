import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const isOffline = process.env.IS_OFFLINE === 'true';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: isOffline ? process.env.DB_HOST : process.env.RDS_HOSTNAME,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: ['src/entities/**/*.ts'],
    migrations: ['src/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts'],
});

export const connectDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};
