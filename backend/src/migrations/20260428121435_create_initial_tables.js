/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.string("role").defaultTo("user"); // user, admin
      table.decimal("balance", 10, 2).defaultTo(0.0);
      table.timestamps(true, true);
    })
    .createTable("payment_proofs", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.decimal("amount", 10, 2).notNullable();
      table.string("reference_number").unique().notNullable();
      table.string("image_path").notNullable();
      table
        .enum("status", ["pending", "approved", "rejected"])
        .defaultTo("pending");
      table
        .integer("admin_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("users");
      table.text("admin_notes").nullable();
      table.timestamps(true, true);
    })
    .createTable("credit_transactions", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.decimal("amount", 10, 2).notNullable(); // Number of credits
      table
        .enum("type", ["spend", "topup", "admin_adjustment", "refund"])
        .notNullable();
      table
        .integer("payment_proof_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("payment_proofs");
      table.string("description").nullable();
      table.timestamps(true, true);
    })
    .createTable("generated_qrs", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.text("original_payload").notNullable();
      table.text("modified_payload").notNullable();
      table.string("custom_name").notNullable();
      table.string("qr_source").nullable(); // e.g., GCash, Maya, QRPH
      table.timestamps(true, true);
    })
    .createTable("audit_logs", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("users");
      table.string("action").notNullable(); // e.g., 'LOGIN', 'QR_GEN', 'PROOF_REJECT'
      table.text("details").nullable();
      table.string("ip_address").nullable();
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("audit_logs")
    .dropTableIfExists("generated_qrs")
    .dropTableIfExists("credit_transactions")
    .dropTableIfExists("payment_proofs")
    .dropTableIfExists("users");
};
