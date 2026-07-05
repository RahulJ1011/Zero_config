const {Command} = require('commander')
const {logger} = require('../ui/logger')
const {config}= require('../utils/config')
const inquirer = require('inquirer')
const { handleError } = require('../utils/errors')


const loginCommand = new Command('login')
    .description('Login to your ASRKing account')
    .action(async() => {
        try
        {
            logger.space()
            logger.info('Login into ASRKing account')
            logger.space();

            const answers = await inquirer.prompt([{
                type: 'input',
                name: 'email',
                message: 'Email:',
                validate: (val)=> val.includes('@') || 'Enter a valid Email'
            },
        {
            type: 'password',
            name: 'password',
            message: 'Password',
            mask: '*'
        }])


        logger.space();
        spinner.start('Logging in...............')
        await sleep(2000)


         config.set('apiKey', 'th_demo_key_123')
      config.set('email', answers.email)
      config.set('token', answers.token)
     


       spinner.succeed('Logged in successfully')
      logger.space()
      logger.success(`Welcome, ${answers.email}`)
      logger.space()
        }
        catch(err)
        {
            console.log(err)
            handleError(err);
        }
    })


    function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {loginCommand}