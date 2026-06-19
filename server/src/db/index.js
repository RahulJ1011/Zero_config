
import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from '../config/database.js'
import { user } from './schema/user.js'
import { deployments } from './schema/deployments.js'
import { app } from './schema/app.js'
import { envVars } from './schema/envVars.js'

export const db = drizzle(sql, {
  schema: { user, deployments, app, envVars }
})