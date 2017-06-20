var express = require('express');
var router = express.Router();
var pg = require('pg')
var db = require('../queries');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'GitHub User Search' });
});

router.get('/api/users/:partialLogin', db.suggestedUsernames);

module.exports = router;
