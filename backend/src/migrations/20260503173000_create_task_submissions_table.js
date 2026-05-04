/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("task_submissions", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("task_key").notNullable();
    table.string("task_title").notNullable();
    table.string("submitted_value").notNullable();
    table.decimal("reward_credits", 10, 2).notNullable().defaultTo(0);
    table
      .enum("status", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("pending");
    table
      .integer("admin_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users");
    table.text("admin_notes").nullable();
    table.timestamp("approved_at").nullable();
    table.timestamps(true, true);

    table.index(["user_id", "task_key"]);
    table.index(["status", "created_at"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("task_submissions");
};
