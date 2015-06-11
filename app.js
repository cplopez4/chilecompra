/*  Aplicación móvil de Cómo Chile Compra - AbreCL
    Copyright (C) 2014 - Zoohash

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */

var express = require('express')
  , http = require('http')
  , bodyParser = require('body-parser')
  , path = require('path')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser');

/* Mongoose - MongoDB */
var mongoose = require('mongoose');
var mongo = mongoose.connect('mongodb://127.0.0.1:27017/chilecompra3');

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
