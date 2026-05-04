const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("credit_packages").del();
  await knex("users").where({ role: "admin" }).del();

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  await knex("users").insert([
    {
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
      balance: 999999,
    },
  ]);

  // Create Credit Packages
  await knex("credit_packages").insert([
    { name: "Starter Pack", price: 50.0, credits: 50.0 },
    { name: "Pro Pack", price: 100.0, credits: 110.0 },
    { name: "Business Pack", price: 500.0, credits: 600.0 },
    { name: "Enterprise Pack", price: 1000.0, credits: 1300.0 },
  ]);
};
