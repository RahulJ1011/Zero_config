const {Command} = require('commander')
const {logger} = require('../ui/logger')
const {config}= require('../utils/config')
const inquirer = require('inquirer')
const {spinner} = require('../ui/spinner')
const { handleError } = require('../utils/errors')
const SERVER_URL = 'http://localhost:3000'

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
        const res = await fetch(`${SERVER_URL}/auth/login`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: answers.email,
                password: answers.password
            })
        })

        const data = await res.json();

        if(!res.ok)
        {
            spinner.fail('Login failed')
             logger.error(data.error || 'Invalid email or password')
                process.exit(1)
        }
         config.set('apiKey', data.token)
      config.set('email', data.user.email)
      config.set('token', data.token)
     


       spinner.succeed('Logged in successfully')
      logger.space()
      logger.success(`Welcome, ${data.user.email}`)
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