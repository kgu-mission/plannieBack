var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('Hello, this is the main page of your plannie.');
});

module.exports = router;

