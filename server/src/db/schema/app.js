const {text,integer,timestamp} = require('drizzle-orm/pg-core')
const {users} = require('./user')
const { PgTable } = require('drizzle-orm/pg-core')

const apps = new PgTable('apps', {

    id: text('id').primaryKey(),

    userId: text('user_id')
        .notNull()
        .references(()=> users.id, {onDelete: 'cascade'}),


        name: text('name').notNull().unique(),

        language: text('language'),
        framework: text('framework'),
        runTime: text('runTime'),

         status: text('status').default('deploying'),


  url: text('url'),


  region: text('region').default('eu'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  port: integer('port')


})


module.exports = {apps}