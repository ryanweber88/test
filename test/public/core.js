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

socket.on('added', function(data) {
	console.log(data);
});

socket.on('removed', function(data) {
	console.log(data);
});

socket.on('client_console', function(data) {
	console.log(data);
});

socket.on('new_dirs', function(data) {
	rewriteDirs(dirs);
});

function rewriteDirs(data) {
	var children = [];

	for ( index in data ) {
		children.push({
			'text': data[index].text + ' ' + data[index].pool
		});
	}

	console.log('tree rewritten');

	$('#tree_view').jstree('destroy');

	$('#tree_view').jstree({
		'core' : {
		    'data' : [
				{
					'text' : 'Root',
					'state' : {
						'opened' : true,
						'selected' : true
					},
					'children' : children
				}
		    ],
		    "themes" : { "theme": "default" },
		    "plugins" : [ "themes", "ui" ]
		}
 	});
}

function mainController($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all dirs and show them
	$http.get('/api/dirs')
		.success(function(data) {
			$scope.dirs = data;
			// console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// Get all directories and show tree
	$http.get('/api/start')
		.success(function(data) {
			var children = [];

			for ( index in data ) {
				children.push({
					'text': data[index].text + ' ' + data[index].pool
				});
			}

			console.log('tree start');

			$('#tree_view').jstree('destroy');

			$('#tree_view').jstree({
				'core' : {
				    'data' : [
						{
							'text' : 'Root',
							'state' : {
								'opened' : true,
								'selected' : true
							},
							'children' : children
						}
				    ],
				    "themes" : { "theme": "default" },
				    "plugins" : [ "themes", "ui" ]
				}
		 	});
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
				// console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.createParentNode = function() {
		$http.post('/api/nodes', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.dirs = data;
				console.log(data);

				// var children = [];

				// for ( index in data ) {
				// 	children.push({
				// 		'text': data[index].text + ' ' + data[index].pool
				// 	});
				// }

				// console.log('rewriting tree');

				// $('#tree_view').jstree('destroy');

				// $('#tree_view').jstree({
				// 	'core' : {
				// 	    'data' : [
				// 			{
				// 				'text' : 'Root',
				// 				'state' : {
				// 					'opened' : true,
				// 					'selected' : true
				// 				},
				// 				'children' : children
				// 			}
				// 	    ],
				// 	    "themes" : { "theme": "default" },
				// 	    "plugins" : [ "themes", "ui" ]
				// 	}
			 // 	});

			 	// var new_tree = {
					// 'core' : {
					//     'data' : [
					// 		{
					// 			'text' : 'Root',
					// 			'state' : {
					// 				'opened' : true,
					// 				'selected' : true
					// 			},
					// 			'children' : children
					// 		}
					//     ],
					//     "themes" : { "theme": "default" },
					//     "plugins" : [ "themes", "ui" ]
					// }
			 	// };

			 	// // update all clients
			 	// socket.emit('new_tree', {data: new_tree });

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
				// console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

}

$(document).ready(function(){
    $('#tree_view').jstree({
		'core' : {
		    'data' : [
				{
					'text' : 'Root',
					'state' : {
						'opened' : true,
						'selected' : true
					},
					'children' : [
						{ 'text' : 'Child 1' },
						{ 'text' : 'Child 2' },

					]
				}
		    ],
		    "themes" : { "theme": "default" },
		    "plugins" : [ "themes", "ui" ]
		}
 	});
});

