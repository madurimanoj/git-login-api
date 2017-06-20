var promise = require('bluebird');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/github_users';
var db = pgp(connectionString);

var query = "SELECT login, similarity(login, $1) AS sml FROM users WHERE login % $1 ORDER BY sml DESC, login LIMIT 12;"
// add query functions
var suggestedUsernames = (req, res, next) => {
  var partialLogin = req.params.partialLogin
  db.many(query, partialLogin)
    .then((data) => {
      res.status(200)
        .json({
          status: 'success',
          data,
        });
    })
}

module.exports = {
  suggestedUsernames: suggestedUsernames
};
