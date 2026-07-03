const DATABASE_CONFIGS = {

  postgres: {
    image:        'postgres:15-alpine',
    internalPort: 5432,
    envVars: (appName) => [
      `POSTGRES_DB=${appName}`,
      `POSTGRES_USER=postgres`,
      `POSTGRES_PASSWORD=thaking123`,
    ],
    connectionUrl: (appName) =>
      `postgresql://postgres:thaking123@db:5432/${appName}`,
    volumePath: '/var/lib/postgresql/data',
  },

  mysql: {
    image:        'mysql:8',
    internalPort: 3306,
    envVars: (appName) => [
      `MYSQL_DATABASE=${appName}`,
      `MYSQL_USER=appuser`,
      `MYSQL_PASSWORD=thaking123`,
      `MYSQL_ROOT_PASSWORD=thakingroot123`,
    ],
    connectionUrl: (appName) =>
      `mysql://appuser:thaking123@db:3306/${appName}`,
    volumePath: '/var/lib/mysql',
  },

  mongodb: {
    image:        'mongo:7',
    internalPort: 27017,
    envVars: (appName) => [
      `MONGO_INITDB_DATABASE=${appName}`,
      `MONGO_INITDB_ROOT_USERNAME=admin`,
      `MONGO_INITDB_ROOT_PASSWORD=thaking123`,
    ],
    connectionUrl: (appName) =>
      `mongodb://admin:thaking123@db:27017/${appName}?authSource=admin`,
    volumePath: '/data/db',
  },

  sqlite: {
    // sqlite doesn't need a separate container
    // it's just a file inside the app's own container
    image:        null,
    internalPort: null,
    envVars:      () => [],
    connectionUrl: (appName) => `file:./${appName}.db`,
    volumePath:   null,
  },
}


function getDbEnvVarName(dbType) {
  if (dbType === 'mongodb') return 'MONGODB_URI'
  if (dbType === 'mysql')   return 'DATABASE_URL'
  return 'DATABASE_URL'  
}

module.exports = { DATABASE_CONFIGS,getDbEnvVarName }