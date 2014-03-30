var scotchTodo = angular.module('testDirectory', []);


var socket = io.connect('http://50.112.173.66:8080');

socket.on('welcome', function(data) {
    $('#messages').html('<li>' + data.message + '</li>');

    socket.emit('i am client', {data: 'foo!'});
});
socket.on('time', function(data) {
    console.log(data);
    $('#messages').html('<li>' + data.time + '</li>');
});
socket.on('test', function(data) {
    console.log(data);
});
socket.on('error', function() { console.error(arguments) });
socket.on('message', function() { console.log(arguments) });

//io.sockets.emit('added', { msg: 'added post' });

socket.on('added', function(data) {
	console.log(data);
});

socket.on('removed', function(data) {
	console.log(data);
});

function mainController($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all dirs and show them
	$http.get('/api/dirs')
		.success(function(data) {
			$scope.dirs = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createDir = function() {
		$http.post('/api/dirs', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.dirs = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a dir after checking it
	$scope.deleteDir = function(id) {
		$http.delete('/api/dirs/' + id)
			.success(function(data) {
				$scope.dirs = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

}

$(document).ready(function(){
    $('#tree_view').jstree({ 'core' : {
    'data' : [
		'Simple root node',
		{
			'text' : 'Root node 2',
			'state' : {
				'opened' : true,
				'selected' : true
			},
			'children' : [
				{ 'text' : 'Child 1' },
				'Child 2'
			]
		}
    ],
    "themes" : [ "theme": "default" ],
    "plugins" : [ "themes", "ui" ]
} });

});

