const {Command} = require('commander')
const { spinner } = require('../ui/spinner')
const { logger } = require('../ui/logger')
const chalk = require('chalk')


const SERVER_URL = 'http://localhost:3000'

const appsCommand = new Command('apps')
.description('List all deployed apps')
.action(async() => {
    try
    {
        if(!config.isLoggedIn())
        {
            logger.error('You are not logged in')
            logger.dim('Run: zeroconfig login');
            process.exit(1)
        }
        const res = await fetch(`${SERVER_URL}/apps`,{
            headers: {
                'Authorization': `Bearer ${config.get('token')}` 
            }
        })

        const data = res.json();

        if(!res.ok)
        {
            logger.error(data.error || 'Failed to fetch apps')
            process.exit(1);
        }

        logger.space()

        for(const app of data.apps)
        {

            const statusColor = 
            app.status === 'live' ? chalk.green(app.status)
            : app.status === 'deploying' ? chalk.yellow(app.status)
            : app.status === 'failed' ? chalk.red(app.status)
            : chalk.dim(app.status)


             console.log(`  ${chalk.bold(app.name)}`)
        console.log(`    Status:    ${statusColor}`)
        console.log(`    Framework: ${chalk.dim(app.framework || 'unknown')}`)
        console.log(`    URL:       ${app.url ? chalk.blue(app.url) : chalk.dim('not deployed yet')}`)
        console.log(`    Created:   ${chalk.dim(new Date(app.createdAt).toLocaleDateString())}`)
        logger.space()

        }
    }

    catch(err)
    {
        spinner.fail('action failed')
        logger.error(err.message)
    }
})


module.exports = {appsCommand}