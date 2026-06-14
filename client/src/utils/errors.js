const chalk = require('chalk');



const handleError = (error)=>
{
    console.log('')

    if(error.isASRKingError)
    {
        console.log(chalk.red(`x ${error.message}`))


    if(error.hint)
    {
        console.log(chalk.yellow(`Hint: ${error.hint}`))
    }
    
    }
    else
    {
        console.log(chalk.red(`x Something went wrong`))
        console.log(chalk.yellow(`x ${error.message}`))
    }
    console.log(' ')
    process.exit(1);

    
}




const createError = (message, hint = null)=> 
{
    const error = new Error(message)
    error.isASRKingError = true
    error.hint = hint;
    return error;
}

module.exports = {createError, handleError}