const chalk = require('chalk');


 const logger = {
    
    success: (msg) => console.log(chalk.green(`${msg}`)),

    error: (msg)=> console.log(chalk.red('X ${msg}')),

     warn: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),

 
  info: (msg) => console.log(chalk.blue(`→ ${msg}`)),

  log: (msg) => console.log(msg),

 
  space: () => console.log(''),

 
  dim: (msg) => console.log(chalk.dim(msg)),
}

module.exports={logger}