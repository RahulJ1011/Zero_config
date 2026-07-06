const {Command} = require('commander')
const {logger} = require('../ui/logger')
const {spinner} = require('../ui/spinner')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { config } = require('../utils/config')
const SERVER_URL = 'http://localhost:3000'
 const destroyCommand = new Command('destroy')
.description('Destroy a deployed app')
.argument('<app-name>', 'name of the app to destroy')
.option('-y, --yes', ' skip confirmation')
.action(async (appName, options)=> {
    try
    {


        if(!config.isLoggedIn())
        {
            logger.error('you are not logged in')
            logger.dim('Run: zeroconfig login')
            process.exit(1);
        }
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
      const listRes = await fetch(`${SERVER_URL}/apps`,{
        headers:{
            'Authorization' : `Bearer ${config.get('token')}`
        }
      })

      const listData = await listRes.json();

      if(!listRes.ok)
      {
        spinner.fail('Failed to fetch apps');
        logger.error(listData.error || 'Could not reach server')
        process.exit(1)
      }

      const app = listData.apps.find(a => a.name === appName);

      if(!app)
      {
        spinner.fail(`App "${appName}" not found`)
        logger.dim('Run: zeroConfig apps to see your deployed apps')
        process.exit(1);
      }

      const deleteRes = await fetch(`${SERVER_URL}/apps/${app.id}`, {
        method:  'DELETE',
        headers: {
          'Authorization': `Bearer ${config.get('token')}`
        }
      })

      const deleteData = await deleteRes.json()

      if (!deleteRes.ok) {
        spinner.fail('Failed to destroy app')
        logger.error(deleteData.error || 'Destroy failed on server')
        process.exit(1)
      }

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

module.exports = {destroyCommand}
