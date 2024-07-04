/**
 * This init file initializes the database
 * and seeds it.
 * 
 * The user can then run npm start to interact
 * with the CLI that controls the database
*/
import { createPostgresClient } from "./util/postgres.js";
import { faker } from '@faker-js/faker';

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

async function seedTables() {
    const client = await createPostgresClient("employees_db");

    try {
        // Create an arbitrary number of departments
        const departments = [];
        const departmentsCount = 10;
        for (let i = 0; i < departmentsCount; i++) {
            const departmentName = faker.commerce.department();
            if (departments.includes(departmentName)) {
                // Skip this iteration
                i--;
                continue;
            }

            departments.push(departmentName);
            // Insert into department table a new department
            // and get back it's ID
            await client.query(
                'INSERT INTO department (name) VALUES ($1)',
                [departmentName]
            );
        }

        // Create an arbitrary number of roles
        const titles = [];
        const rolesCount = 15;
        for (let i = 0; i < rolesCount; i++) {
            const title = faker.person.jobTitle();
            if (titles.includes(title)) {
                // Skip this iteration
                i--;
                continue;
            }

            titles.push(title);
            const salary = faker.finance.amount({ min: 30000, max: 150000, dec: 0 });
            const departmentId = Math.floor(Math.random() * departmentsCount) + 1;
            await client.query(
                'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
                [title, salary, departmentId]
            );
        }

        // Generate the employees
        for (let i = 0; i < 100; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const roleId = Math.floor(Math.random() * rolesCount) + 1;
            // The first generated employees are managers as long
            // as they are less than the number of departments
            const isManager = i < departmentsCount;

            await client.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                [firstName, lastName, roleId, isManager ? i + 1 : null]
            );
        }

        console.log('Database seeded successfully');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await client.end();
    }
}

async function init() {
    await resetDatabase();
    await createTables();
    await seedTables();
}

init();