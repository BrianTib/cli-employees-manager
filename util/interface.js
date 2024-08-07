import { createPostgresClient } from "./postgres.js";
import inquirer from 'inquirer';

const ACTIONS = {
    VIEW_DEPARTMENTS: 1,
    VIEW_ROLES: 2,
    VIEW_EMPLOYEES: 3,
    ADD_DEPARTMENT: 4,
    ADD_ROLE: 5,
    ADD_EMPLOYEE: 6,
    UPDATE_EMPLOYEE: 7,
    /* BONUS */
    UPDATE_EMPLOYEE_MANAGER: 8,
    VIEW_EMPLOYEES_BY_MANAGER: 9,
    VIEW_EMPLOYEES_BY_DEPARTMENT: 10,
    DELETE_DEPARTMENT: 11,
    DELETE_ROLE: 12,
    DELETE_EMPLOYEE: 13,
    VIEW_BUDGET: 14,

    EXIT: 15
};

export class CompanyInterface {
    constructor() {
        this.db = createPostgresClient();
    }

    async prompt() {
        // Check that the database client is connected
        if (typeof this.db.then === 'function') {
            this.db = await this.db;
        }

        try {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: "What action would you like to perform?",
                    choices: [
                        { name: 'View all departments', value: ACTIONS.VIEW_DEPARTMENTS },
                        { name: 'View all roles', value: ACTIONS.VIEW_ROLES },
                        { name: 'View all employees', value: ACTIONS.VIEW_EMPLOYEES },
                        { name: 'Add a department', value: ACTIONS.ADD_DEPARTMENT },
                        { name: 'Add a role', value: ACTIONS.ADD_ROLE },
                        { name: 'Add an employee', value: ACTIONS.ADD_EMPLOYEE },
                        { name: 'Add and update an employee role', value: ACTIONS.UPDATE_EMPLOYEE },
                        new inquirer.Separator(),
                        // BONUS ACTIONS
                        { name: 'Update an employee manager', value: ACTIONS.UPDATE_EMPLOYEE_MANAGER },
                        { name: 'View employees by manager', value: ACTIONS.VIEW_EMPLOYEES_BY_MANAGER },
                        { name: 'View employees by department', value: ACTIONS.VIEW_EMPLOYEES_BY_DEPARTMENT },
                        { name: 'Delete a department', value: ACTIONS.DELETE_DEPARTMENT },
                        { name: 'Delete a role', value: ACTIONS.DELETE_ROLE },
                        { name: 'Delete an employee', value: ACTIONS.DELETE_EMPLOYEE },
                        { name: 'View the total utilized budget of a department', value: ACTIONS.VIEW_BUDGET },
                        new inquirer.Separator(),
                        { name: 'Exit', value: ACTIONS.EXIT },
                    ]
                },
            ]);
    
            return this.processPrompt(answers);
        } catch(error) {
            console.log(error);
        }
    }

    async processPrompt({ action }) {
        switch (action) {
            case ACTIONS.EXIT: {
                // Close the database connection gracefully
                await this.db.end();
                process.exit();
            } break;

            case ACTIONS.VIEW_DEPARTMENTS: {
                const query = await this.db.query("SELECT * FROM department");
                console.table(query.rows);
            } break;
            
            case ACTIONS.VIEW_ROLES: {
                const query = await this.db.query(`
                    SELECT role.id, role.title, role.salary, department.name AS department
                    FROM role
                    JOIN department ON role.department_id = department.id
                    ORDER BY role.id
                `);
                console.table(query.rows);
            } break;
            
           case ACTIONS.VIEW_EMPLOYEES: {
                const query = await this.db.query(`
                    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department,
                    role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                    FROM employee JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id
                    ORDER BY employee.id
                `);
                console.table(query.rows);
            } break;

            case ACTIONS.ADD_DEPARTMENT: {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: "Enter the department name"
                    }
                ]);
                
                await this.db.query("INSERT INTO department (name) VALUES ($1)", [answers.name]);
                console.log("Department added successfully");
            } break;

            case ACTIONS.ADD_ROLE: {
                const departments = await this.db.query("SELECT * FROM department");
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: "Enter the role title"
                    },
                    {
                        type: 'number',
                        name: 'salary',
                        message: "Enter the role salary"
                    },
                    {
                        type: 'list',
                        name: 'department_id',
                        message: "Select the department",
                        choices: departments.rows.map(department => ({ name: department.name, value: department.id }))
                    }
                ]);
                
                await this.db.query(`
                    INSERT INTO role (title, salary, department_id)
                    VALUES ($1, $2, $3)
                `, [answers.title, answers.salary, answers.department_id]);
                
                console.log("Role added successfully");
            } break;

            case ACTIONS.ADD_EMPLOYEE: {
                const roles = await this.db.query("SELECT * FROM role");
                const employees = await this.db.query("SELECT * FROM employee");
                
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "Enter the employee's first name"
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "Enter the employee's last name"
                    },
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "Select the employee's role",
                        choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
                    },
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Select the employee's manager",
                        choices: [
                            // Allow the option to not assign a manager
                            { name: `No Manager`, value: null },
                            ...employees.rows
                            .filter(employee => employee.manager_id === null)
                            .map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
                        ]
                    }
                ]);
                
                await this.db.query(`
                    INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES ($1, $2, $3, $4)
                `, [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
                
                console.log("Employee added successfully");
            } break;

            case ACTIONS.UPDATE_EMPLOYEE: {
                const roles = await this.db.query("SELECT * FROM role");
                const employees = await this.db.query("SELECT * FROM employee");
                
                // Prompt the user for the employee's name
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "Enter the employee's first name"
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "Enter the employee's last name"
                    }
                ]);

                // Make sure the user entered a valid name
                if (answers.first_name === "" || answers.last_name === "") {
                    console.log("Please enter a valid first and last name.");
                    break;
                }

                // Try to find the employee
                const employee = employees.rows.find(employee => employee.first_name === answers.first_name && employee.last_name === answers.last_name);
                if (!employee) {
                    console.log("Employee not found.");
                    break;
                }

                const newRole = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "Select the employee's new role",
                        choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
                    },
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Select the employee's manager (leave blank for no changes)",
                        choices: [
                            // Allow the option to not assign a manager
                            // which makes them a manager
                            { name: `No Manager`, value: null },
                            ...employees.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
                        ]
                    }
                ]);
                
                // Update the employee's role and manager
                await this.db.query(
                    `
                    UPDATE employee
                    SET role_id = $1, manager_id = $2
                    WHERE id = $3
                    `,
                    [newRole.role_id, newRole.manager_id, employee.id]
                );
                console.log("Employee updated successfully");
            } break;

            case ACTIONS.UPDATE_EMPLOYEE_MANAGER: {
                const employees = await this.db.query("SELECT * FROM employee");
                // Prompt the user for the employee's name
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "Enter the manager's first name"
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "Enter the manager's last name"
                    }
                ]);

                // Make sure the user entered a valid name
                if (answers.first_name === "" || answers.last_name === "") {
                    console.log("Please enter a valid first and last name.");
                    break;
                }

                // Try to find the employee
                const employee = employees.rows.find(employee => employee.first_name === answers.first_name && employee.last_name === answers.last_name);
                if (!employee) {
                    console.log("Employee not found.");
                    break;
                }

                const newManager = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Select the employee's new manager",
                        choices: employees.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
                    }
                ]);
                
                // Update the employee's manager
                await this.db.query(
                    `
                    UPDATE employee
                    SET manager_id = $1
                    WHERE id = $2
                    `,
                    [newManager.manager_id, employee.id]
                );
                console.log("Employee updated successfully");
            } break;

            case ACTIONS.VIEW_EMPLOYEES_BY_MANAGER: {
                const employees = await this.db.query("SELECT * FROM employee");
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Select the manager",
                        choices: employees.rows
                            .filter(employee => employee.manager_id === null)
                            .map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
                    }
                ]);

                const query = await this.db.query(`
                    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department,
                    role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                    FROM employee JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id
                    WHERE employee.manager_id = $1
                    ORDER BY employee.id
                `, [answers.manager_id]);

                // Dont show the manager in the list
                console.table(query.rows.filter(employee => employee.id !== employee.manager_id));
            } break;

            case ACTIONS.VIEW_EMPLOYEES_BY_DEPARTMENT: {
                const departments = await this.db.query("SELECT * FROM department");
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'department_id',
                        message: "Select the department",
                        choices: departments.rows.map(department => ({ name: department.name, value: department.id }))
                    }
                ]);

                const query = await this.db.query(`
                    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department,
                    role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                    FROM employee JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id
                    WHERE department.id = $1
                    ORDER BY employee.id
                `, [answers.department_id]);

                console.table(query.rows);
            } break;

            case ACTIONS.DELETE_DEPARTMENT: {
                const departments = await this.db.query("SELECT * FROM department");
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'department_id',
                        message: "Select the department to delete",
                        choices: departments.rows.map(department => ({ name: department.name, value: department.id }))
                    }
                ]);

                await this.db.query("DELETE FROM department WHERE id = $1", [answers.department_id]);
                console.log("Department deleted successfully");
            } break;

            case ACTIONS.DELETE_ROLE: {
                const roles = await this.db.query("SELECT * FROM role");
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "Select the role to delete",
                        choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
                    }
                ]);

                await this.db.query("DELETE FROM role WHERE id = $1", [answers.role_id]);
                console.log("Role deleted successfully");
            } break;

            case ACTIONS.DELETE_EMPLOYEE: {
                const employees = await this.db.query("SELECT * FROM employee");
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee_id',
                        message: "Select the employee to delete",
                        choices: employees.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
                    }
                ]);

                await this.db.query("DELETE FROM employee WHERE id = $1", [answers.employee_id]);
                console.log("Employee deleted successfully");
            } break;

            case ACTIONS.VIEW_BUDGET: {
                const departments = await this.db.query("SELECT * FROM department");
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'department_id',
                        message: "Select the department to view the budget",
                        choices: departments.rows.map(department => ({ name: department.name, value: department.id }))
                    }
                ]);

                const query = await this.db.query(`
                    SELECT SUM(role.salary) AS total_budget
                    FROM role
                    WHERE role.department_id = $1
                `, [answers.department_id]);

                console.table(query.rows);
            } break;
        }

        // Prompt the user again
        return this.prompt();
    }
}