var scotchTodo = angular.module('testDirectory', []);

var socket = io.connect('http://50.112.173.66:8080');

socket.on('error', function() { console.error(arguments) });
socket.on('message', function() { console.log(arguments) });
socket.on('client_console', function(data) {
	console.log(data);
});

socket.on('new_dirs', function(data) {
	rewriteDirs(data.dirs);
});

function rewriteDirs(dirs) {
	var data     = [];
	var children = [];

	// Pull out all the child nodes and insert into arr
	for ( index in dirs ) {

		if ( dirs[index].parent_id != null ) {

			if ( children[dirs[index].parent_id] == undefined ) {
				children[dirs[index].parent_id] = [];
			}
			children[dirs[index].parent_id].push({
				'a_attr': {
					'href': dirs[index]._id
				},
				'text': dirs[index].text,
				'state': {
					'selected' : false
				}
			});
		}

	}

	// Find parent nodes and apply children to them
	for ( index in dirs ) {
		
		var child_nodes = [];

		if ( children[dirs[index]._id] != undefined ) {
			child_nodes = children[dirs[index]._id]
		}

		if ( dirs[index].hierarchy == 1 ) {
			data.push({
				'a_attr': {
					'href': dirs[index]._id
				},
				'text': dirs[index].text + ' ' + dirs[index].pool,
				'state': {
					'opened' : true,
					'selected' : false
				},
				children: child_nodes
			});
		}

	}

	// Destroy old tree
	$('#tree_view').jstree('destroy');

	// Generate new tree
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
				$scope.formData.text = '';
				$scope.dirs          = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.createParentNode = function() {
		$http.post('/api/nodes', $scope.formData)
			.success(function(data) {
				$scope.formData.text = '';
				$scope.dirs          = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.createChildren = function(parent_id, num_child_nodes) {
		$http.post('/api/children/' + parent_id + '/' + num_child_nodes, $scope.formData)
			.success(function(data) {
				$scope.formData.text = '';
				$scope.dirs          = data;
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
	            		var parent_id       = $(this).attr('href');
	            		var num_child_nodes = $('#num_child_nodes').val();

	            		if ( num_child_nodes != '' &&
	            			 num_child_nodes > 0 &&
	            			 num_child_nodes <= 15 ) {
	            			$scope.createChildren(parent_id, num_child_nodes);
	            		} else {
	            			alert('Please enter a number between 1 and 15');
	            		}
	            		break;
	            	case 'remove_node':
	            		var id_to_remove = $(this).attr('href');
	    				$scope.deleteDir(id_to_remove);
	            		break;
	            	default:
	            		console.log('nil');
	            }
	        },
	        items: {
	            "generate_randoms": {name: "Generate Numbers"},
	            "remove_node":      {name: "Remove Node"},
	            "sep1":             "---------",
	            "quit":             {name: "Quit"}
	        }
	    });
	});



}
