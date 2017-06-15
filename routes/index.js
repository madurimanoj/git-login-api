var express = require('express');
var router = express.Router();

var db = require('../queries');

router.get('/api/users/:partialLogin', db.suggestedUsernames);

module.exports = router;
