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
	rewriteDirs(data.dirs);
});

function rewriteDirs(dirs) {
	var data = [];
	var children = [];

	for ( index in dirs ) {
		// children.push({
		// 	attributes: { href : dirs[index].id },
		// 	'text': dirs[index].text + ' ' + dirs[index].pool
		// });

		data.push({
			'a_attr': {
				'href': dirs[index]._id
			},
			'text': dirs[index].text + ' ' + dirs[index].pool,
			'state': {
				'selected' : false
			}
			// children:[]
		});

	}


	//$('#tree_view').jstree('destroy');

	$('#tree_view').jstree({
		'core' : {
		    'data' : data,
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
			rewriteDirs(data);
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
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.createChildren = function() {
		$http.post('/api/children', $scope.formData)
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
				console.log('deleted');
				rewriteDirs(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};



	// Setup jstree
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

	$(function(){
	    $.contextMenu({
	        selector: '.jstree-anchor', 
	        callback: function(key, options) {

	            switch ( key ) {
	            	case 'generate_randoms':
	            		console.log('generating randoms');
	            		break;
	            	case 'remove_node':
	            		var id_to_remove = $(this).attr('href');
	            		console.log('removing node');
	    				$scope.deleteDir(id_to_remove);
	            		break;
	            	default:
	            		console.log('nil');
	            }
	        },
	        items: {
	            "generate_randoms": {name: "Generate Numbers"},
	            "remove_node": {name: "Remove Node"},
	            "sep1": "---------",
	            "quit": {name: "Quit"}
	        }
	    });
	});



}
