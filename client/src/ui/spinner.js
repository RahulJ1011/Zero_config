const ora = require('ora')
const chalk = require('chalk');

let SpinnerInstance = null;

 const spinner ={

    start: (msg)=> {
        SpinnerInstance = ora({
            text: msg,
            color: 'blue'
        }).start()
    },

    succeed: (msg)=> {
        
        if(SpinnerInstance){
            SpinnerInstance.succeed(chalk.green(msg))
        }
    },

    fail: (msg)=> {
        
        if(SpinnerInstance){
            SpinnerInstance.fail(chalk.red(msg))
        }
    },

    update: (msg)=> {
        
        if(SpinnerInstance){
            SpinnerInstance.text = msg
        }
    },

    stop: (msg)=> {
        
         if(SpinnerInstance){
            SpinnerInstance.stop()
        }
    }
}

module.exports={spinner}