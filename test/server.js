var http     = require('http');
var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var server   = app.listen(8080);
var io       = require('socket.io').listen(server);

mongoose.connect('mongodb://ryanweber88:Snickers1@novus.modulusmongo.net:27017/hOdu5jix');

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
});

// Directory model construct
var Directory = mongoose.model('Directory', {
	text:        String,
	hierarchy:   Number,
	pool:        String,
	parent_id:   String,
	lower_bound: Number,
	upper_bound: Number
});


app.get('/api/dirs', function(req, res) {

	Directory.find(function(err, dirs) {

		if (err) { res.send(err); }
		res.json(dirs);
	});
});

app.get('/api/start', function(req, res) {

	Directory.find(function(err, dirs) {
		if (err) { res.send(err); }
		res.json(dirs);
		io.sockets.emit('client_console', { dirs: dirs });
	});

});


app.post('/api/dirs', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	Directory.create({
		text : req.body.text,
		done : false
	}, function(err, todo) {
		if (err){ res.send(err); }

		Directory.find(function(err, dirs) {
			if (err) { res.send(err); }
			res.json(dirs);
			io.sockets.emit('client_console', { dirs: dirs });
		});
	});
});

app.post('/api/nodes', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	var random_lower = Math.floor((Math.random() * 1000) + 1);
	var random_upper = Math.floor((Math.random() * (1000 - random_lower + 1) ) + random_lower);

	Directory.create({
		text:        req.body.text,
		hierarchy:   1,
		pool:        '(' + random_lower + ' - ' + random_upper + ')',
		lower_bound: random_lower,
		upper_bound: random_upper,
		parent_id:   null,
		done:        false
	}, function(err, todo) {
		if (err){ res.send(err); }

		// get and return all the todos after you create another
		Directory.find(function(err, dirs) {
			if (err) { res.send(err); }
			res.json(dirs);
			io.sockets.emit('new_dirs', { dirs: dirs });
			io.sockets.emit('client_console', { dirs: dirs });
		});
	});
});

app.post('/api/children/:parent_id', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	Directory.remove({
		parent_id : req.params.parent_id
	}, function(err, dir) {
		if (err) { res.send(err); }
	});

	Directory.find({
		_id : req.params.parent_id
	}, function(err, directory) {
		if (err) { res.send(err); }

		var dir    = directory[0];

		for ( var i = 1; i < 7; i++ ) {
			var random = Math.floor((Math.random() * (dir.upper_bound - dir.lower_bound + 1) ) + dir.lower_bound);

			io.sockets.emit('client_console', { msg : 'passed' });
			Directory.create({
				text:      random,
				hierarchy: 2,
				parent_id: req.params.parent_id,
				done:      false
			}, function(err, todo) {
				if (err){ res.send(err); }

				// get and return all the todos after you create another
				Directory.find(function(err, dirs) {
					if (err) { res.send(err); }
					res.json(dirs);
					io.sockets.emit('new_dirs', { dirs: dirs });
					io.sockets.emit('client_console', { dirs: dirs });
				});
			});
		}

	});

});

app.delete('/api/dirs/:dir_id', function(req, res) {

	io.sockets.emit('client_console', { request_body: req.body });

	Directory.remove({
		_id : req.params.dir_id
	}, function(err, dir) {
		if (err) { res.send(err); }

		// get and return all the todos after you create another
		// Directory.find(function(err, dirs) {
		// 	if (err) { res.send(err); }
		// 	res.json(dirs);
		// 	io.sockets.emit('new_dirs', { dirs: dirs });
		// 	io.sockets.emit('client_console', { dirs: dirs });
		// });
	});

	Directory.remove({
		parent_id : req.params.dir_id
	}, function(err, dir) {
		if (err) { res.send(err); }

		// get and return all the todos after you create another
		Directory.find(function(err, dirs) {
			if (err) { res.send(err); }
			res.json(dirs);
			io.sockets.emit('new_dirs', { dirs: dirs });
			io.sockets.emit('client_console', { dirs: dirs });
		});
	});
});

app.get('*', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

console.log('Listening on port 8080');

