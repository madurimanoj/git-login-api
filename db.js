const pg = require('pg');


var config = {
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.HOST,
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
};

pg.defaults.ssl = true;
const pool = new pg.Pool(config);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

module.exports.connect = function (callback) {
  return pool.connect(callback);
};

// var promise = require('bluebird');
//
// var options = {
//   promiseLib: promise
// };
//
// var pgp = require('pg-promise')(options);
// var connectionString = 'postgres://localhost:5432/github_users';
// var db = pgp(connectionString);
//
// module.exports = {
//   suggestedUsernames: suggestedUsernames
// };
