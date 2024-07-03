import { createPostgresClient } from "./postgres.js";
import inquirer from 'inquirer';

const ACTIONS = {
    VIEW_DEPARTMENTS: 1,
    VIEW_ROLES: 2,
    VIEW_EMPLOYEES: 3,
    ADD_EMPLOYEE: 4,
    ADD_UPDATE_EMPLOYEE: 5,
};

export class CompanyInterface {
    constructor() {
        this.db = createPostgresClient();
    }

    async prompt() {
        // Check that the database client is connected
        if ('then' in this.db && typeof this.db.then === 'function') {
            await Promise.resolve(this.db);
        }

        try {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: "What would you like to do?",
                    choices: [
                        { name: 'View all departments', value: ACTIONS.VIEW_DEPARTMENTS },
                        { name: 'View all roles', value: ACTIONS.VIEW_ROLES },
                        { name: 'View all employees', value: ACTIONS.VIEW_EMPLOYEES },
                        { name: 'Add an employee', value: ACTIONS.ADD_EMPLOYEE },
                        { name: 'Add and update an employee role', value: ACTIONS.ADD_UPDATE_EMPLOYEE }
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
        }
        
        return Promise.resolve();
    }
}