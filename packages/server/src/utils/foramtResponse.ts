import chalk from "chalk";
import * as fs from "fs";
import { Response } from '../entity/Response';
import * as path from 'path';

export const formatResponse = (res: Response) => {
  if (res.error) {
    console.log(chalk.yellow(`[${chalk.red.bold('!')}] ERROR : ${chalk.red(res.id)}`));

    fs.appendFileSync(path.join(__dirname, '..', 'logs', `${process.env.ERROR_LOG}`), `[${new Date()}] [ ${res.id} ] : ${res.path} ${res.message} ${res.stacktrace}`);
  
    return res.id;
  }
  return res;
}