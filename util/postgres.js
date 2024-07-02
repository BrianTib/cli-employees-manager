import { Client } from 'pg';

// Return a new postgress client
export async function createPostgresClient() {
    const client = new Client();
    await client.connect();

    // Create the employee tables
    await createEmployeeTables(client);

    return client;
}

async function createEmployeeTables(client) {
    if (!client) { return; }

    // Create the departments table
    const departmentTable = client.query(`
        CREATE TABLE department (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30)
        );
    `);

    // Create the roles table
    const roleTable = client.query(`
        CREATE TABLE role (
            id SERIAL PRIMARY KEY,
            title VARCHAR(30),
            salary DECIMAL,
            department INTEGER,
            FOREIGN KEY (department) REFERENCES department(id)
        );
    `);

    const employeeTable = client.query(`
        CREATE TABLE employee (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(30),
            last_name VARCHAR(30),
            role_id INTEGER NOT NULL,
            manager_id INTEGER NOT NULL,
            FOREIGN KEY (role_id) REFERENCES role(id),
            FOREIGN KEY (manager_id) REFERENCES employee(id)
        );
    `);

    await Promise.all([
        departmentTable,
        roleTable,
        employeeTable
    ]);
}