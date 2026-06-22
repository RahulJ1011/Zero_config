const Redis = require('ioredis')
const {config} = require('./index')

const redis = new Redis(config.redisUrl,{
    maxRetriesPerRequest: null
})


redis.on('connect',()=> {
    console.log('Redis connected............')
})


redis.on('error',(err)=>
{
    console.log('Redis Error: ', err.message)
})


module.exports = {redis}