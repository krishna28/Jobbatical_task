var express = require('express');

var bodyParser =  require('body-parser');

var pgp = require('pg-promise')(/*options*/)

var morgan = require('morgan');

var config = require('./config');


var db = pgp(config.databaseUrl)

var app = express();


app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var api = require('./app/routes/service')(app,express,db);

app.use('/api', api); // end point will be accessed by appending api to the end point


// app.get('/',function(req,res){
//     res.sendFile(__dirname + '/public/app/views/index.html');
// });

app.listen(config.port,function(err){

  if(err){
    console.log("error");
  }else{
    console.log("server listening on port 3000");   
  }

});

