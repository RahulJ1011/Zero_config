const {timestamp} = require('drizzle-orm/pg-core')
const {apps} = require('./app')
const { pgTable } = require('drizzle-orm/pg-core')
const { text } = require('drizzle-orm/mysql-core')

const deployments = pgTable('deployments',{
    id: text('id').primaryKey(),

    appId: text('app_id')
        .notNull()
        .references(()=> apps.id, {onDelete: 'cascade'}),

        status: text('status').default('queing'),

        logs: text('logs'),

        commitHash: text('commit_hash'),

        errorMessage: text('error_message'),

        createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

module.exports = {deployments}