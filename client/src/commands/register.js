const {Command} = require('commander');
const { logger } = require('../ui/logger');
const { spinner } = require('../ui/spinner');
const { config } = require('../utils/config');




const SERVER_URL = 'http://localhost:3000'

const registerCommand = new Command('register')
.description('Create a new Zero config account')
.action(async() => {
    try
    {
        const inquirer = require('inquirer');
        logger.space()
        logger.space();


        const answer = await inquirer.prompt([
           {
                 type: 'input',
                name: 'email',
                message: 'Email: ',
                validate: (val) => val.includes('@') || 'Enter a valid email'
           },
           {
            type: 'password',
            name: 'password',
            message:'password',
            mask: '*',
            validate: (val)=> val.length >= 8 || 'Password must ne atleast 8 characters'
           },
           {
              type:    'password',
          name:    'confirmPassword',
          message: 'Confirm password:',
          mask:    '*',
          validate: (val, answers) => {
            if (val !== answers.password) return 'Passwords do not match'
            return true
           }
        }
        ])


        logger.space();
        spinner.start('Creating an account');

        const res = await fetch(`${SERVER_URL}/auth/register`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: answers.email,
                password: answers.password
            })
        })

        const data = await res.json()

        if(!res.ok)
        {
            spinner.fail('Registration failed')
            logger.error(data.error || 'Could not create account')
            process.exit(1);
        }


        config.set('token', data.token);
        config.set('apiKey',data.apiKey);
        config.set('email', data.user.email);

        spinner.succeed('Account created sucessfully');
        logger.space();
        logger.success('Welcome to zero Config', data.user.email);
        logger.dim(`Your api key: ${data.apiKey}`)
        logger.space();
    }
    catch(err)
    {
        spinner.fail('Registartion failed');
        logger.error(err.message)
    }
})

module.exports={registerCommand}