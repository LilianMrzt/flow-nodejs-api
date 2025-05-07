import { Client } from 'pg';

export const createDatabase = async () => {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || 'localhost',
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('Connected to the postgres database.');

        const dbName = process.env.DB_NAME;

        // Check if the database exists before creating it
        const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (result.rowCount === 0) {
            // Create the new database
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
    } catch (error) {
        console.error('Error creating database:', error);
    } finally {
        await client.end();
    }
};
