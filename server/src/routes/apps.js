const { listApps, getApp, createAppHandler } = require('../handlers/apps');
const {authMiddleware} = require('../middleware/auth')


const appRoutes = async(fastify)=>
{
    fastify.addHook('preHandler',authMiddleware);

    fastify.get('/apps',listApps)

    fastify.get('/apps/:id',getApp);

    fastofy.post('/apps',{
        schema:
        {
            body:
            {
                type:'object',
                required: ['name'],
        properties: {
          name:      { type: 'string', minLength: 1, maxLength: 50 },
          language:  { type: 'string' },
          framework: { type: 'string' },
          region:    { type: 'string' }
        }
            }
        }
    },createAppHandler)


     fastify.delete('/apps/:id', deleteAppHandler)
}

module.exports = {appRoutes}