const {Command} = require('commander')
const logger = require('../utils/config')
const chalk = require('chalk')
const SERVER_URL = 'http://localhost:3000'

const logsCommand = new Command('logs')
   .description('Stream logs from your deployed app')
  .argument('[app-name]', 'app name')
  .option('-t, --tail <lines>', 'number of lines', '100')
    .action(async(appName,options)=> {

        const name = appName || 'my-app'

        logger.space()
        logger.info(`Streaming logs for ${chalk.bold(name)}`)
        logger.space()

        const fakeFlags = [
          'Starting server on port 3000',
        'Connected to database',
        'GET / 200 in 45ms',
        'GET /api/users 200 in 23ms',
        'POST /api/deploy 201 in 156ms',
        ]

        for (const log of fakeLogs) {
      console.log(chalk.dim(new Date().toISOString()) + '  ' + log)
      await sleep(500)
    }

    })

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


module.exports = {logsCommand}