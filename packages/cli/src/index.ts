import * as inquirer from "inquirer";
import * as fs from "fs";
// import * as path from "path";

const CHOICES =  fs.readdirSync(`${__dirname}/../templates`);

const QUESTIONS = [
    {
      name: 'project-choice',
      type: 'list',
      message: 'What project template would you like to generate?',
      choices: CHOICES
    },
    {
      name: 'project-name',
      type: 'input',
      message: 'Specify the name of your Project:',
      validate: function (input: string) {
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else return 'Project name may only include letters, numbers, underscores and hashes.';
      }
    }
  ];
  
  
  inquirer.prompt(QUESTIONS)
    .then(answers => {
      console.log(answers);
  });