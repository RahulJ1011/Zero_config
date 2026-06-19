const {apps} = require('./app')


const envVars = require('envVars', {

    id: text('id').primaryKey(),

    appId: text('app_id')
    .notNull()
    .references(()=> apps.id, {onDelete: cascade}),

     key: text('key').notNull(),

       encryptedValue: text('encrypted_value').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})


module.exports = {envVars}