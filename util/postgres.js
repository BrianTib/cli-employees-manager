import pg from 'pg';
const { Client } = pg;

// Return a new postgress client
export async function createPostgresClient(database = "employees_db") {
    const client = new Client({
        user: 'postgres',
        password: 'mysql',
        host: 'localhost',
        database
    });
    
    await client.connect();
    return client;
}