var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('ejemplo.ejs', { title: 'Express' });
});

module.exports = router;
