/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("credit_packages", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable(); // e.g., 'Starter Pack'
      table.decimal("price", 10, 2).notNullable(); // ₱50.00
      table.decimal("credits", 10, 2).notNullable(); // 50 credits
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);
    })
    .alterTable("payment_proofs", (table) => {
      table
        .integer("package_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("credit_packages");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("payment_proofs", (table) => {
      table.dropForeign(["package_id"]);
      table.dropColumn("package_id");
    })
    .dropTableIfExists("credit_packages");
};
