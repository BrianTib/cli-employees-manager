import { Client } from 'pg';

// Return a new postgress client
export async function createPostgresClient() {
    const client = new Client();
    return client.connect();
}