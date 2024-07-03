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

    // Create the employee tables
    await createEmployeeTables(client);
    await generateMockData(client);

    return client;
}

async function createEmployeeTables(client) {
    if (!client) { return; }

    try {
        // Create the departments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS department (
                id SERIAL PRIMARY KEY,
                name VARCHAR(30) UNIQUE NOT NULL
            );
        `);

        // Create the roles table
        await client.query(`
            CREATE TABLE IF NOT EXISTS role (
                id SERIAL PRIMARY KEY,
                title VARCHAR(30) UNIQUE NOT NULL,
                salary DECIMAL NOT NULL,
                department_id INTEGER NOT NULL,
                FOREIGN KEY (department_id) REFERENCES department(id)
            );
        `);

        // Create the employees table
        await client.query(`
            CREATE TABLE IF NOT EXISTS employee (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(30) NOT NULL,
                last_name VARCHAR(30) NOT NULL,
                role_id INTEGER NOT NULL,
                manager_id INTEGER,
                FOREIGN KEY (role_id) REFERENCES role(id),
                FOREIGN KEY (manager_id) REFERENCES employee(id)
            );
        `);

        console.log("Tables created successfully.");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

// Generate mock data and insert into the database
async function generateMockData(client) {
    try {
        for (let i = 0; i < 100; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const title = faker.person.jobTitle();
            const salary = faker.finance.amount({ min: 30000, max: 150000, dec: 2 });
            const departmentName = faker.commerce.department();
    
            // Insert into department table
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