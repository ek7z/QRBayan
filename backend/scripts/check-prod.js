const mysql = require("mysql2/promise");

async function checkProd() {
  process.env.NODE_ENV = "production";
  require("../loadEnv")();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_SSL_MODE === "REQUIRED"
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
          }
        : undefined,
  });

  try {
    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = [
      "users",
      "credit_packages",
      "payment_proofs",
      "credit_transactions",
      "generated_qrs",
      "audit_logs",
    ];
    const counts = {};

    for (const tableName of tableNames) {
      const [rows] = await connection.query("SELECT COUNT(*) AS count FROM ??", [
        tableName,
      ]);
      counts[tableName] = rows[0].count;
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          tables: tables.length,
          counts,
        },
        null,
        2,
      ),
    );
  } finally {
    await connection.end();
  }
}

checkProd().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error.message,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
