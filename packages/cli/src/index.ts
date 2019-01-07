import * as chalk from 'chalk';
import * as inquirer from "inquirer";
import * as fs from "fs";
// import * as path from "path";
import { APOLLO_LANDER, HEADER_TITLE } from './header';

const CHOICES = fs.readdirSync(`${__dirname}/../templates`);

const QUESTIONS = [
  {
    name: "project-name",
    type: "input",
    message: "Specify the name of your Project:",
    validate: function(input: string) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    }
  },
  {
    name: "project-choice",
    type: "list",
    message: "What project template would you like to generate?",
    choices: CHOICES
  }
];

const CURR_DIR = process.cwd();

//============================================
// Logging out the apollo lunar lander header 
console.log(APOLLO_LANDER);
HEADER_TITLE.split('\n').forEach(line => {
  console.log(("                                                                " + line).slice(43));
});

//============================================
// prompting with inquirer
inquirer.prompt(QUESTIONS)
  .then((answers: any) => {
    const projectChoice = answers['project-choice'];
    const projectName = answers['project-name'];
    const templatePath = `${__dirname}/../templates/${projectChoice}`;
  
    fs.mkdirSync(`${CURR_DIR}/${projectName}`);

    createDirectoryContents(templatePath, projectName);
  });

function createDirectoryContents (templatePath: string, newProjectPath: string) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;
    
    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, 'utf8');
      
      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf8');
    }
  });
}
