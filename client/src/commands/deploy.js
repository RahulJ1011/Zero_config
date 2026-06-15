const Command = require('commander');
const {logger} = require('../ui/logger');
const {spinner} = require('../ui/spinner')
const {banner} = require('../ui/banner');
const {handleError} = require('../utils/errors');
const inquirer = require('inquirer')

export const deployCommand = new Command('deploy')
    .description("Deploy your app to ASRKing")
    .option("'y, --yes", 'skip confirmation prompts')
    .option('-n, --name <name>', 'app name (auto detected if not provided)')
    .option('-r, --region <region>', 'deployment region', 'eu')
    .action(async (options)=> {
        try
        {
            if(!config.isLoggedIn())
            {
                logger.error('you are not logged in')
                logger.dim('Run: ASRKing login')
                process.exit(1)
            }

            logger.info('starting deployment');

            spinner.start("Detecting your stack...............................")
            await sleep(2000);
            spinner.succeed('Detected: spring boot')


             logger.space()
      logger.log('  App name:   ' + chalk.bold(options.name || 'my-app'))
      logger.log('  Framework:  ' + chalk.bold('Next.js'))
      logger.log('  Database:   ' + chalk.bold('Postgres'))
      logger.log('  Region:     ' + chalk.bold(options.region))
      logger.space()


      if(!options.yes)
      {
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'proceed',
                message: 'Deploy now',
                default: true
            }])
      }

      if(!answer.proceed)
      {
        logger.warn('Deployment cancelled!!!!!!!!')
        process.exit(0)
      }


      logger.space(0);
      spinner.start("Building your app")
       await sleep(2000)
      spinner.succeed('Build complete')

      spinner.start('Deploying to server...')
      await sleep(2000)
      spinner.succeed('Deployed successfully')

      spinner.start('Setting up HTTPS...')
      await sleep(1000)
      spinner.succeed('HTTPS ready')

       logger.space()
      logger.success('Your app is live!')
      logger.space()
      logger.log('  ' + chalk.bold.blue('https://my-app.thaking.dev'))
      logger.space()
      logger.dim('  Deploy time: 12 seconds')
      logger.space()
        }
        catch(err)
        {
            handleError(err);
        }
    })

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve,ms))
}