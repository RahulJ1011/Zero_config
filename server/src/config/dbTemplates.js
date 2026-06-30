const DB_TEMPLATES = {
  postgres: {
    image: 'postgres:15-alpine',
    port: 5432,
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
    image: 'mysql:8',
    port: 3306,
    envVars: (appName) => [
      `MYSQL_DATABASE=${appName}`,
      `MYSQL_ROOT_PASSWORD=thaking123`,
    ],
    connectionUrl: (appName) =>
      `mysql://root:thaking123@db:3306/${appName}`,
    volumePath: '/var/lib/mysql',
  },
  mongodb: {
    image: 'mongo:7',
    port: 27017,
    envVars: (appName) => [
      `MONGO_INITDB_DATABASE=${appName}`,
    ],
    connectionUrl: (appName) =>
      `mongodb://db:27017/${appName}`,
    volumePath: '/data/db',
  },
  sqlite: null, // sqlite needs no separate service — file-based, lives inside the app container
}

module.exports = { DB_TEMPLATES }