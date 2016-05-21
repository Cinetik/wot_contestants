(function() {
	'use strict';

	var Hapi = require('hapi');
	var server = new Hapi.Server();
	var http = require('http');
	var config = require('config');

	// Server running on leet ninja port
	server.connection({
		port: config.get('local.port')
	});

	// Loading route to access service
	server.route(require('./routes/cups'));

	// start API service
	server.start(function(error){
		if (error) {
			throw error;
		}
		console.log('[Server]', 'Server started at: ' + server.info.uri);
	});


})();
