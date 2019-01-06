import * as inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";

const CHOICES =  fs.readdirSync(`${__dirname}/templates`);