const {startDestroyWorker} = require('./destroy.worker')

const {startDeployWorker} = require('./deploy.worker')

export const startAllWorkers = ()=>
{
    startDeployWorker()
    startDestroyWorker();
}