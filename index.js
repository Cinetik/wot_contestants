(function() {
	'use strict';

	var Hapi = require('hapi');
	var Joi = require('joi');
	var server = new Hapi.Server();
	var http = require('http');
	var config = require('config');
	var justDoIt = process.argv[2];

	// enable CLI mode
	if(justDoIt === 'cli'){
		var CupsManager = require('./managers/cupsmanager');
		var options = {
			game: process.argv[3] || 'worldoftanks',
			zone: process.argv[4] || 'europe',
			limit: process.argv[5] || '25',
		};
		var schema = {
			game: Joi.string(),
			zone: Joi.string().regex(/^(europe|north-america|anz)$/i),
			limit: Joi.number().optional(),
		};
		Joi.validate(options,schema, function(error, value){
			if(error){
				throw error;
			}
			return Promise.resolve(new CupsManager()).then(function(cManager){
				cManager.getContestants(options.game, options.zone, options.limit)
					.then(function(teams){
						console.log(teams);
					}).catch(function(reason){
						throw reason;
					});
			});
		});
	} else {
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
	}


})();
