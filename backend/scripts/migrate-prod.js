const path = require("path");
const { spawnSync } = require("child_process");

const backendRoot = path.join(__dirname, "..");
const knexCommand =
  process.platform === "win32"
    ? path.join(backendRoot, "node_modules", ".bin", "knex.cmd")
    : path.join(backendRoot, "node_modules", ".bin", "knex");

const result =
  process.platform === "win32"
    ? spawnSync(
        "cmd.exe",
        ["/c", knexCommand, "migrate:latest", "--env", "production"],
        {
          cwd: backendRoot,
          stdio: "inherit",
          env: {
            ...process.env,
            NODE_ENV: "production",
          },
        },
      )
    : spawnSync(knexCommand, ["migrate:latest", "--env", "production"], {
        cwd: backendRoot,
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: "production",
        },
      });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status || 0);
