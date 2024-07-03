import pg from 'pg';
import { faker } from '@faker-js/faker';
const { Client } = pg;

// Return a new postgress client
export async function createPostgresClient() {
    const client = new Client({
        user: 'postgres',
        password: 'mysql',
        host: 'localhost',
        database: 'employees_db'
    });
    
    await client.connect();
    await generateMockData(client);

    return client;
}

// Generate mock data and insert into the database
async function generateMockData(client) {
    try {
        for (let i = 0; i < 100; i++) {
            // Generate fake data
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const title = faker.person.jobTitle();
            const salary = faker.finance.amount({ min: 30000, max: 150000, dec: 2 });
            const departmentName = faker.commerce.department();

            // Insert into department table a new department
            // and get back it's ID
            const resDept = await client.query(
                'INSERT INTO department (name) VALUES ($1) RETURNING id',
                [departmentName]
            );

            const departmentId = resDept.rows[0].id;
    
            // Insert into role table
            const resRole = await client.query(
                'INSERT INTO role (title, salary, department) VALUES ($1, $2, $3) RETURNING id',
                [title, salary, departmentId]
            );
            const roleId = resRole.rows[0].id;
    
            // Insert into employee table
            await client.query(
                'INSERT INTO employee (first_name, last_name, role_id) VALUES ($1, $2, $3)',
                [firstName, lastName, roleId]
            );
        }

        console.log('Mock data generated successfully.');
    } catch (err) {
        console.error('Error generating mock data:', err);
    }
}