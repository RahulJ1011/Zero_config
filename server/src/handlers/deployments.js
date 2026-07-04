const {nanoid} = require('nanoid')
const Redis = require('ioredis')
const {Queue} =  require('bullmq');
const { getAppById } = require('../db/queries/apps');
const { findFreePort } = require('../utils/port');
const { createDeployment, getDeploymentId } = require('../db/queries/deployments');
const { logger } = require('../utils/logger');



const deployQueue = new Queue('deploy',{
    connection: Redis
})
const destroyQueue = new Queue('destroy',{connection: Redis})
const deployHandler = async(req,res)=>
{
    const {appId, manifest} = req.body;

    const app = await getAppById(appId);
    console.log(app);
    if(!app)
    {
        return res.status(404).send({
            msg:"App not found"
        })

    }

    if(app.userId!==req.userId)
    {
        console.log(app.userId)
        console.log(req.userId)
        return res.status(401).send({
            error:"Access denied"
        })
    }

    const port = await findFreePort(3000);

    const deployment = await createDeployment({
        id: 'deploy'+nanoid(12),
        appId: app.id,
        status:"queued"
    })

     const job = await deployQueue.add('deploy', {
    deploymentId: deployment.id,
    appId:        app.id,
    appName:      app.name,
    manifest: manifest || {
         language:  app.language ,
      framework: app.framework ,
      runtime:   app.runtime   ,
      buildCmd:  null,
      startCmd:  'npm start',
      port:      3000,
      services:  {},
      envVars:   { required: [], detected: [] },
    },
    port: 3000
   
  })

  logger.info("Deployment Queued",app.name)


  return res.status(200).send({
    message: 'Deployment started',
    deploymentID: deployment.id,
    jobId: job.id,
    status: 'queued'
  })
}

const destroyHandler = async(req,res)=>
{
    const {appId} = req.body;

    const app = await getAppById(appId);
    if(!app)
    {
        return res.status(404).send({error: 'App not found'})
    }

    if(app.userId!=req.userId)
    {
        return res.status(403).send({error: 'Acces denied'})
    }

    const job = await destroyQueue.add('destroy',{
        appId: app.id,
        appName: app.name
    })

     return reply.status(202).send({
    message: 'Destroy started',
    jobId:   job.id,
    status:  'queued',
  })
}


const getDeploymentsHandler = async(req,res)=>
{
    const deployment = await getDeploymentId(req.params.id)

    if(!deployment)
    {
        return res.status(404).send({error:"Deployments not found"})
    }

    return res.status(200).send({
        deployment
    })
}


module.exports = {getDeploymentsHandler,deployHandler,destroyHandler}