/**
 * This init file initializes the database
 * and seeds it.
 * 
 * The user can then run npm start to interact
 * with the CLI that controls the database
*/
import { createPostgresClient } from "./util/postgres.js";

async function resetDatabase() {
    const client = await createPostgresClient("postgres");
    
    // Drop and recreate the database
    try {
        await client.query("DROP DATABASE IF EXISTS employees_db");
        await client.query("CREATE DATABASE employees_db");
        console.log("Database reset successful.");
    } catch (error) {
        console.error("Error resetting database:", error);
    } finally {
        await client.end();
    }
}

async function createTables() {
    const client = await createPostgresClient("employees_db");

    try {
        const queries = [
            // Add the departments table
            `
            CREATE TABLE IF NOT EXISTS department (
                id SERIAL PRIMARY KEY,
                name VARCHAR(64) NOT NULL
            )
            `,
            // Add the roles table
            `
            CREATE TABLE IF NOT EXISTS role (
                id SERIAL PRIMARY KEY,
                title VARCHAR(64) UNIQUE NOT NULL,
                salary DECIMAL NOT NULL,
                department_id INTEGER NOT NULL,
                FOREIGN KEY (department_id) REFERENCES department(id)
            )
            `,
            // Add the employees table
            `
            CREATE TABLE IF NOT EXISTS employee (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                role_id INTEGER NOT NULL,
                manager_id INTEGER,
                FOREIGN KEY (role_id) REFERENCES role(id),
                FOREIGN KEY (manager_id) REFERENCES employee(id)
            )
            `
        ];

        // Execute all of the queries
        for (const query of queries) {
            await client.query(query);
        }

        console.log("Tables created successfully for employee_db.");
    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        await client.end();
    }
}

async function init() {
    await resetDatabase();
    await createTables();
}

init();