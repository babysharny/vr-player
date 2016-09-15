var express = require('express');

var app = express();

app.get('/', function (req, res) {
	res.send('Hello Node in ISS!');
});


app.listen(process.env.PORT);