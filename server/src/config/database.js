const postgres = require('postgres')
const {config} = require('../index.js')

export const sql = postgres(config.databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
})