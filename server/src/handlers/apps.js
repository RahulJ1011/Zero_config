const {createApp, deleteApp, getAppById, getAppsByUser} = require("../db/queries/apps")

const {nanoid} =  require('nanoid')



const listApps = async(req,res)=>
{
    const apps = await getAppsByUser(req.userId)
    return {apps}
}


const getApp = async(req,res)=>
{
    const app = await getAppById(req.params.id);

    if(!app)
    {
        return res.status(404).send({error: 'App not found'})
    }

    if(app.userId!== req.userId)
    {
        return res.status(400).send({error: 'Access denied'})
    }

    return {app}
}

const createAppHandler = async(req,res)=>
{
    const {name,language, framework,region} = req.body;

    const app = await createApp({
        id: 'app_'+nanoid(12),
        userId: req.userId,
        name,
        language,
        framework,
        region: region|| 'eu',
        status: 'created'
    })

    logger.info("App Created",name)

    return res.status(201).send({app})
}

const DeleteAppHandler = async(req,res)=>
{
    const app = await getAppById(req.params.id)

    if(!app)
    {
        return res.status(404).send({
            error: 'app not found'
        })
    }

    if(app.userId!==req.userId)
    {
        return reply.status(403).send({ error: 'Access denied' })
    }

    await deleteApp(app.id)

    logger.info('App deleted', app.name)

  return { message: 'App deleted successfully' }
}

module.exports = {createAppHandler,listApps,getApp,deleteApp}