const {Worker} = require('bullmq')
const {redis} = require('../config/redis')
const {logger} = require("../utils/logger")
const { sshService } = require('../services/ssh')
const { removeCaddyRoute } = require('../services/caddy')
const { deleteRecord } = require('../services/cloudfare')
const { deleteApp } = require('../handlers/apps')


const startDestroyWorker = ()=>
{
    const worker = new Worker('destroy', async(job)=> {

        const {appId,appName} = job.data

        logger.info('Destroy job started', appName)

        logger.info('Removing containers',appName);

        await sshService.destroy(appName)

        logger.info('Removing Caddy Route',appName)

        await removeCaddyRoute(appName)

        logger.info('Removing DNS Record', appName)
        await deleteRecord(appName);

        logger.info('Deleting from database', appName)
        await deleteApp(appId)

        logger.info("App Destroyed", appName)

        return {status: 'destroyed', appName}
    },{connection: redis})

    worker.on('completed',(job)=>{
        logger.info('Destroy job completed',job.id,'completed')
    })

    worker.on('failed',(job,error)=>{
        logger.error('Destroy job',job.id,' failed', error.message)
    })

    return worker;
}

module.exports = {startDestroyWorker}