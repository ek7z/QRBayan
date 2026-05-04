const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

const loadEnvFile = (fileName) => {
  const fullPath = path.join(__dirname, "..", fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return dotenv.parse(fileContents);
};

const buildConnectionConfig = (env) => ({
  host: env.DB_HOST,
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl:
    env.DB_SSL_MODE === "REQUIRED"
      ? {
          rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : undefined,
});

const tableOrder = [
  "users",
  "credit_packages",
  "payment_proofs",
  "credit_transactions",
  "generated_qrs",
  "audit_logs",
];

const insertRows = async (connection, tableName, rows) => {
  if (!rows.length) {
    return;
  }

  const columns = Object.keys(rows[0]);
  const values = rows.map((row) => columns.map((column) => row[column]));
  const placeholders = values
    .map(() => `(${columns.map(() => "?").join(", ")})`)
    .join(", ");

  await connection.query(
    `INSERT INTO \`${tableName}\` (${columns
      .map((column) => `\`${column}\``)
      .join(", ")}) VALUES ${placeholders}`,
    values.flat(),
  );
};

async function migrateDevToProd() {
  const devEnv = loadEnvFile(".env.development");
  const prodEnv = loadEnvFile(".env.production");

  const devConnection = await mysql.createConnection(buildConnectionConfig(devEnv));
  const prodConnection = await mysql.createConnection(buildConnectionConfig(prodEnv));

  try {
    const dataset = {};

    for (const tableName of tableOrder) {
      const [rows] = await devConnection.query(`SELECT * FROM \`${tableName}\``);
      dataset[tableName] = rows;
    }

    await prodConnection.beginTransaction();
    await prodConnection.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const tableName of [...tableOrder].reverse()) {
      await prodConnection.query(`DELETE FROM \`${tableName}\``);
    }

    for (const tableName of tableOrder) {
      await insertRows(prodConnection, tableName, dataset[tableName]);
    }

    await prodConnection.query("SET FOREIGN_KEY_CHECKS = 1");
    await prodConnection.commit();

    const summary = Object.fromEntries(
      tableOrder.map((tableName) => [tableName, dataset[tableName].length]),
    );
    console.log(JSON.stringify({ success: true, summary }, null, 2));
  } catch (error) {
    await prodConnection.rollback();
    await prodConnection.query("SET FOREIGN_KEY_CHECKS = 1");
    throw error;
  } finally {
    await devConnection.end();
    await prodConnection.end();
  }
}

migrateDevToProd().catch((error) => {
  console.error(
    JSON.stringify(
      {
        success: false,
        message: error.message,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
