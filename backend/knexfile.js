require("./loadEnv")();

const buildSslConfig = () => {
  if (process.env.DB_SSL_MODE !== "REQUIRED") {
    return undefined;
  }

  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
  };
};

const buildConnection = () => ({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "qrph_db",
  ssl: buildSslConfig(),
});

module.exports = {
  development: {
    client: 'mysql2',
    connection: buildConnection(),
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
  production: {
    client: 'mysql2',
    connection: buildConnection(),
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
};
