const {startDestroyWorker} = require('./destroy.worker')

const {startDeployWorker} = require('./deploy.worker')

 const startAllWorkers = ()=>
{
    startDeployWorker()
    startDestroyWorker();
}

module.exports = {startAllWorkers}