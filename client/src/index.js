const {program} = require('commander')
const {showBanner} = require('./ui/banner')
const {destroyCommand} = require('./commands/destroy')
const {deployCommand} = require('./commands/deploy')
const {loginCommand} = require('./commands/login')
const {logsCommand} = require('./commands/logs')
const {registerCommand} = require('./commands/register')
const { appsCommand } = require('./commands/apps')

showBanner()

program
.name('ASRKing')
.description('Zero config deployment - just ship')
.version('0.1.0')

program.addCommand(registerCommand)
program.addCommand(loginCommand)
program.addCommand(logsCommand)
program.addCommand(deployCommand)
program.addCommand(destroyCommand)
program.addCommand(appsCommand)

if(process.argv.length < 3)
{
    program.help()
}

program.parse(process.argv)