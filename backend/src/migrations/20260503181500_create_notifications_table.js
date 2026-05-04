/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("type").notNullable().defaultTo("info");
    table.string("title").notNullable();
    table.text("message").nullable();
    table.timestamp("delivered_at").nullable();
    table.timestamp("read_at").nullable();
    table.timestamps(true, true);

    table.index(["user_id", "delivered_at"]);
    table.index(["user_id", "created_at"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notifications");
};
