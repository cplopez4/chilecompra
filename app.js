var express = require('express')
  , http = require('http')
  , bodyParser = require('body-parser')
  , path = require('path')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser');

/* Mongoose - MongoDB */
var mongoose = require('mongoose');
var mongo = mongoose.connect('mongodb://127.0.0.1:27017/chilecompra');

/* Routes */
var routes = require('./routes/index');
var api = require('./routes/api');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', api);

app.listen(3000, function(){
	console.log("Bienvenido a Chile Compra - AbreCL 2014");
});