var express = require('express');
var router = express.Router();
var pg = require('pg')
// var pool = require('../db');
// console.log(pg.defaults)

// var query = "SELECT login, similarity(login, $1) AS sml FROM users WHERE login % $1 ORDER BY sml DESC, login LIMIT 12;"
// // add query functions
// var suggestedUsernames = (req, res, next) => {
//   var partialLogin = req.params.partialLogin
//   db.many(query, partialLogin)
//     .then((data) => {
//       res.status(200)
//         .json({
//           status: 'success',
//           data,
//         });
//     })
// }

router.get('/', function(req, res, next) {
  res.render('index', { title: 'GitHub User Search' });
});

pg.defaults.ssl = true;
router.get('/api/users/:partialLogin', function(req, res, next) {
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;

  client
  .query("SELECT login, similarity(login, $1) AS sml FROM users WHERE login % $1 ORDER BY sml DESC, login LIMIT 12;", [req.params.partialLogin])
    .then(data => {
      res.status(200)
        .json({
          status: 'success',
          data,
          rows: data.rows

        })
    })
  });
});


module.exports = router;
