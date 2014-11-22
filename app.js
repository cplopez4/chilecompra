var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
  res.render('ejemplo');
});

app.listen(3000, function(){
	console.log("Server escuchando puerto 3000");
});