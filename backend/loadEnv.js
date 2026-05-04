const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const loadedFiles = new Set();

const loadEnv = () => {
  const environment = process.env.NODE_ENV || "development";
  const candidateFiles = [
    `.env.${environment}.local`,
    `.env.${environment}`,
    ".env.local",
    ".env",
  ];

  candidateFiles.forEach((fileName) => {
    const fullPath = path.join(__dirname, fileName);

    if (!fs.existsSync(fullPath) || loadedFiles.has(fullPath)) {
      return;
    }

    dotenv.config({ path: fullPath, override: false });
    loadedFiles.add(fullPath);
  });
};

module.exports = loadEnv;
