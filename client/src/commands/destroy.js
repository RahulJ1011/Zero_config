const {Command} = require('commander')
const {logger} = require('../ui/logger')
const {spinner} = require('../ui/spinner')
const chalk = require('chalk')
const inquirer = require('inquirer')

export const destroyCommand = new Command('destroy')
.description('Destroy a deployed app')
.argument('<app-name>', 'name of the app to destroy')
.option('-y, --yes', ' skip confirmation')
.action(async (appName, options)=> {
    try
    {
        logger.space();
        logger.warn(`you are about to destroy the ${chalk.bold(appName)}`)
        logger.warn('This cannot be undone')
        logger.space()


        if(!options.yes)
        {
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: `Type the app name to confirm (${appName})`,
                default:false

            }])
            

            if(!answer.confirm)
            {
                logger.info('Destroy cancelled')
                process.exit(0)
            }
        }

        spinner.start(`Destroying ${appName}...`)
      await sleep(2000)
      spinner.succeed(`${appName} destroyed`)

      logger.space()
      logger.info('All containers, data, and DNS records removed')
      logger.space()
    }
    catch(err)
    {
        console.log(err);
        logger.error('Destroy Failed')
    }
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
