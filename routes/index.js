var express = require('express');
var router = express.Router();
// var pg = require('knex')
var db = require('../db/queries');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'GitHub User Search' });
});

router.get('/api/users/:partialLogin', (req, res, next) =>{

  return db.suggestedUsernames(req.params.partialLogin)
    .then(users => res.status(200).json(shows))
    .catch(error => next(error))
});

module.exports = router;
