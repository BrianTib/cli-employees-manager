import { createPostgresClient } from "./postgres.js";

const ACTIONS = {
    VIEW_DEPARTMENTS: 1,
    VIEW_ROLES: 2,
    VIEW_EMPLOYEES: 3,
    ADD_EMPLOYEE: 4,
    ADD_UPDATE_EMPLOYEE: 5,
};

export class CompanyInterface {
    constructor() {
        this.#connect();
    }

    async #connect() {
        this.client = await createPostgresClient();
    }

    getPrompts() {
        return [
            {
                type: 'list',
                name: 'action',
                message: "What would you like to do?",
                choices: [
                    { name: 'View all departments', value: ACTIONS.VIEW_DEPARTMENTS },
                    { name: 'View all roles', value: ACTIONS.VIEW_ROLES },
                    { name: 'View all employees', value: ACTIONS.VIEW_EMPLOYEES },
                    { name: 'Add an employee', value: ACTIONS.ADD_EMPLOYEE },
                    { name: 'Add and update an employee role', value: ACTIONS.VIEW_DEPARTMENTS }
                ]
            },
        ]
    }

    processPrompt({ action }) {

    }
}