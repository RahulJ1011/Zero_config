




const {sql} = require('../config/database.js')
const {users} = require('./schema/user.js')
const {deployments} =  require('./schema/deployments.js')
const {apps } = require('./schema/app.js')
const {envVars} =  require('./schema/envVars.js')
const {drizzle} = require('drizzle-orm/postgres-js')
 const db = drizzle(sql, {
  schema: { users, deployments, apps, envVars }
})

module.exports = {db}