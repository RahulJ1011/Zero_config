const {Command} = require('commander')
const logger = require('../utils/config')
const chalk = require('chalk')

const logsCommand = new Command('logs')
    .description('Stream logs from your deployed app')
    .argument('[app-name]', 'app name to get logs for')
    .option('t, --tail <lines>', 'number of lines to show', '100')
    .action(async(appName,options)=> {

        const name = appName || 'my-app'

        logger.space()
        logger.info(`Streaming logs for ${chalk.bold(name)}`)
        logger.space()

        const fakeFlags = [

        ]

        for (const log of fakeLogs) {
      console.log(chalk.dim(new Date().toISOString()) + '  ' + log)
      await sleep(500)
    }

    })

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}