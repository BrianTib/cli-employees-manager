DROP DATABASE IF EXISTS employees_db;

CREATE DATABASE employees_db;

-- Create the department table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30)
);

-- Create the role table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department INTEGER,
    FOREIGN KEY (department) REFERENCES department(id)
);

-- Create the employee table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER NOT NULL,
    manager_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);