import { CompanyInterface } from './util/interface.js';
import inquirer from 'inquirer';

function init() {
    const company = new CompanyInterface();

    inquirer
        .prompt(company.getPrompts())
        .then(company.processPrompt);
}

init();