import { config } from '../utils/config';



const Command = require('commander');
const {detect} = require('../detector/index')
const {handleUnknown} = require('../detector/providers/unknown')
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

            logger.space();

            spinner.start("Detecting your stack...............................")
          
            const projectDir = process.cwd()
            const manifest = await detect(projectDir);
            const result = handleUnknown(manifest)
             logger.space()

              if (!result.canProceed) {
        spinner.fail('Could not detect your stack')
        logger.error(result.userMessage)
        process.exit(1)
      }

       spinner.succeed(
        `Detected: ${chalk.bold(result.framework)} · ` +
        `${result.language} · ` +
        `${Math.round(result.confidence * 100)}% confidence`
      )
let appName = options.name
if (!appName) {
        const answer = await inquirer.prompt([{
          type:     'input',
          name:     'appName',
          message:  'App name:',
          default:  projectDir.split('\\').pop().toLowerCase()
                      .replace(/[^a-z0-9-]/g, '-'),
          validate: (val) => {
            if (!val) return 'App name is required'
            if (!/^[a-z0-9-]+$/.test(val)) {
              return 'Only lowercase letters, numbers and hyphens'
            }
            return true
          }
        }])
        appName = answer.appName
      }
      logger.log('  App name:   ' + chalk.bold(options.name|| 'my-app'))
      logger.log('  Framework:  ' + chalk.bold(result.framework))
      logger.log('  RunTime:   ' + chalk.bold(result.runtime))
      logger.log('  Port:     ' + chalk.bold(result.port))

         if (result.services?.database) {
        logger.log(`  Database:   ${chalk.bold(result.services.database.type)}`)
      }

       if (result.envVars?.required?.length > 0) {
        logger.space()
        logger.warn('Secrets needed:')
        result.envVars.required.forEach(key => {
          logger.dim(`  → ${key}`)
        })
      }

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


      spinner.start('connecting to Zero Config server.........')
      const apiKey = config.get('apikey')
      const SERVER_URL = 'http://localhost:3000'
      let app;
      try
      {
        const createRes = await fetch(`${SERVER_URL}/apps`,{
            method:'post',
            headers:{
                'Content-Type':  'application/json',
            'Authorization': `Bearer ${config.get('token')}`,
            },
            body: JSON.stringify({
                name: appName,
                language: result.language,
                framework: result.framework,
                region: 'eu'
            })
        })

        const createData = await createRes.json();
        if(!createRes.ok)
        {
            if(createData.error?.includes('already'))
            {
                logger.warn('App already exists — redeploying')
            }
            else
            {
                throw new Error(createData.error || 'Failed to create app')
            }
        }
        app = createData.app
      } catch(err)
      {
        spinner.fail('Failed to create app on server')
        handleError(err);
      }

      spinner.succeed('App registered on the server')
      spinner.start('starting Deployment.............')

      const deployRes = await fetch(`${SERVER_URL}/deploy`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.get('token')}`
        },
        body: JSON.stringify({
            appId: app.id,
            manifest: result
        })
      })

      const deployData = await deployRes.json()

      if (!deployRes.ok) {
        throw new Error(deployData.error || 'Deployment failed')
      }

      spinner.succeed(`Deployment queued (Job #${deployData.jobId})`)

      spinner.start('Deploying...')

      const jobId = deployData.jobId
      let   done  = false
      let   url   = null

      while(!done)
      {
        await sleep(2000);

        const statusRes = await fetch(`${SERVER_URL}/jobs/${jobId}`,{
            headers:{
                authorization: `Bearer ${config.get('token')}`
            }
        })

        const statusData = statusRes.json();

        if(statusData.status === 'completed')
        {
            done = true
            url = statusData.result?.url
            spinner.succeed('Deployed sucessfully')
        }

        if (statusData.status === 'failed') {
          done = true
          spinner.fail('Deployment failed')
          logger.error(statusData.error || 'Unknown error')
          process.exit(1)
        }
      }

      logger.space()
      logger.success('your app is live')
      logger.space()

      if(url)
      {
        logger.log(' '+ chalk.bold.blue(url))
      }
      logger.space()
      logger.dim(`  App name: ${appName}`)
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