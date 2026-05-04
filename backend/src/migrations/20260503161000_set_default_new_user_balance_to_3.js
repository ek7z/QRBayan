exports.up = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.decimal("balance", 10, 2).defaultTo(3.0).alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.decimal("balance", 10, 2).defaultTo(0.0).alter();
  });
};
