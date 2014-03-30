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
			// 'id': dirs[index]._id,
			'text': dirs[index].text + ' ' + dirs[index].pool,
			'state': {
				'selected' : false
			}
			// children:[]
		});

	}


	// data  : {
	//     type  : "json",
	//     json  : [ 
	//       { attributes: { id : "pjson_1" }, state: "open", data: "Root node 1", children : [
	//         { attributes: { id : "pjson_2" }, data: { title : "Custom icon", icon : "../media/images/ok.png" } },
	//         { attributes: { id : "pjson_3" }, data: "Child node 2" },
	//         { attributes: { id : "pjson_4" }, data: "Some other child node" }
	//       ]}, 
	//       { attributes: { id : "pjson_5" }, data: "Root node 2" } 
	//     ]
	//   }

	$('#tree_view').jstree('destroy');

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

	// delete a dir after checking it
	$scope.deleteDir = function(id) {
		$http.delete('/api/dirs/' + id)
			.success(function(data) {
				$scope.dirs = data;
				console.log('deleted');
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
	            		// var id_to_remove = $(this).attr('href');
	            		console.log('removing node');
	            		// console.log($(this).attr('href'));
	            		//console.log('dir id - ' + dir_id);
	      //       		$http.delete('/api/dirs/' + id_to_remove)
							// .success(function(data) {
							// 	$scope.dirs = data;
							// 	rewriteDirs(data);
							// })
							// .error(function(data) {
							// 	console.log('Error: ' + data);
							// });
	    				$scope.deleteDir(id_to_remove);
	    	// 			$.post('/api/dirs/' + id_to_remove, function (response) {
						// 	console.log(response);
						// });
	            		break;
	            	default:
	            		console.log('nil');
	            }
	        },
	        events: {
				show: function(opt) {
					var id_to_remove = $(this).attr('href');
					//opt.$menu.find('.context-menu-item > span').attr('data-remove', id_to_remove);
					//opt.$menu.find('.context-menu-item > span').attr('ng-click', 'deleteDir(' + id_to_remove + ')');
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

$(document).ready(function(){

	// // Setup jstree
 //    $('#tree_view').jstree({
	// 	'core' : {
	// 	    'data' : [
	// 			{
	// 				'text' : 'Root',
	// 				'state' : {
	// 					'opened' : true,
	// 					'selected' : true
	// 				},
	// 				'children' : [
	// 					{ 'text' : 'Child 1' },
	// 					{ 'text' : 'Child 2' },

	// 				]
	// 			}
	// 	    ],
	// 	    "themes" : { "theme": "default" },
	// 	    "plugins" : [ "themes", "ui" ]
	// 	}
 // 	});

	// $(function(){
	//     $.contextMenu({
	//         selector: '.jstree-anchor', 
	//         callback: function(key, options) {

	//             switch ( key ) {
	//             	case 'generate_randoms':
	//             		console.log('generating randoms');
	//             		break;
	//             	case 'remove_node':
	//             		// var id_to_remove = $(this).attr('href');
	//             		console.log('removed node');
	//             		// console.log($(this).attr('href'));
	//             		//console.log('dir id - ' + dir_id);
	//       //       		$http.delete('/api/dirs/' + id_to_remove)
	// 						// .success(function(data) {
	// 						// 	$scope.dirs = data;
	// 						// 	rewriteDirs(data);
	// 						// })
	// 						// .error(function(data) {
	// 						// 	console.log('Error: ' + data);
	// 						// });
	//     				// $scope.deleteDir(id_to_remove);
	//     				$.post('/api/dirs/' + id_to_remove, function (response) {
	// 						console.log(response);
	// 					});
	//             		break;
	//             	default:
	//             		console.log('nil');
	//             }
	//         },
	//         events: {
	// 			show: function(opt) {
	// 				var id_to_remove = $(this).attr('href');
	// 				//opt.$menu.find('.context-menu-item > span').attr('data-remove', id_to_remove);
	// 				opt.$menu.find('.context-menu-item > span').attr('ng-click', 'deleteDir(' + id_to_remove + ')');
	// 			}
	// 		},
	//         items: {
	//             "generate_randoms": {name: "Generate Numbers"},
	//             "remove_node": {name: "Remove Node"},
	//             "sep1": "---------",
	//             "quit": {name: "Quit"}
	//         }
	//     });
	// });

});

