var http = require('http');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var server = app.listen(8080);
var io = require('socket.io').listen(server);

mongoose.connect('mongodb://ryanweber88:Snickers1@novus.modulusmongo.net:27017/hOdu5jix');

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
});

// Directory model construct
var Directory = mongoose.model('Directory', {
	text : String,
	hierarchy : Number,
	pool : String
});


app.get('/api/dirs', function(req, res) {

	Directory.find(function(err, dirs) {

		if (err) { res.send(err); }
		res.json(dirs);
	});
});


app.post('/api/dirs', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	// create a todo, information comes from AJAX request from Angular
	Directory.create({
		text : req.body.text,
		done : false
	}, function(err, todo) {
		if (err){ res.send(err); }

		// get and return all the todos after you create another
		Directory.find(function(err, dirs) {
			if (err) { res.send(err); }
			res.json(dirs);
			io.sockets.emit('added', { msg: 'added post' });
			io.sockets.emit('client_console', { dirs: dirs });
		});
	});
});

app.post('/api/nodes', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	// create a todo, information comes from AJAX request from Angular
	Directory.create({
		text : req.body.text,
		hierarchy : 2,
		pool : '(' + res.body.upperBound + ' - ' + res.body.lowerBound + ')'
		done : false
	}, function(err, todo) {
		if (err){ res.send(err); }

		// get and return all the todos after you create another
		Directory.find(function(err, dirs) {
			if (err) { res.send(err); }
			res.json(dirs);
			io.sockets.emit('added', { msg: 'added post' });
			io.sockets.emit('client_console', { dirs: dirs });
		});
	});
});

app.delete('/api/dirs/:dir_id', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	Directory.remove({
		_id : req.params.dir_id
	}, function(err, dir) {
		if (err) { res.send(err); }

		// get and return all the todos after you create another
		Directory.find(function(err, dirs) {
			if (err) { res.send(err); }
			res.json(dirs);
			io.sockets.emit('removed', { msg: 'removed post' });
			io.sockets.emit('client_console', { dirs: dirs });
		});
	});
});

app.get('*', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

console.log('Listening on port 8080');

