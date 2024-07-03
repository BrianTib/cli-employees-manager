import { createPostgresClient } from "./postgres.js";
import inquirer from 'inquirer';

const ACTIONS = {
    VIEW_DEPARTMENTS: 1,
    VIEW_ROLES: 2,
    VIEW_EMPLOYEES: 3,
    ADD_EMPLOYEE: 4,
    ADD_UPDATE_EMPLOYEE: 5,
    EXIT: 6
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
                        { name: 'Add an employee', value: ACTIONS.ADD_EMPLOYEE },
                        { name: 'Add and update an employee role', value: ACTIONS.ADD_UPDATE_EMPLOYEE },
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
            case ACTIONS.VIEW_DEPARTMENTS: {
                const query = await this.db.query("SELECT * FROM department");
                console.table(query.rows);
            } break;
            
            case ACTIONS.VIEW_ROLES: {
                const query = await this.db.query("SELECT * FROM role");
                console.table(query.rows);
            } break;
            
            case ACTIONS.VIEW_EMPLOYEES: {
                const query = await this.db.query("SELECT * FROM employee");
                console.table(query.rows);
            } break;
        }
        
        // As long as we're not closing, reprompt the user
        if (action !== ACTIONS.EXIT) {
            return this.prompt();
        }
        
        process.exit();
    }
}