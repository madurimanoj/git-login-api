
exports.up = function(knex, Promise) {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')
    .then(function () {
      return knex.schema.createTable('users', function(table){
        table.increments(); // id serial primary key
        table.string('login');
      });
    })
    .then(function () {
        return knex.raw('CREATE INDEX user_idx ON users USING GIN (login gin_trgm_ops)')
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('authors');
};
