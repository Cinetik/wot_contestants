(function () {
	'use strict';

	var CupsManager = require('../managers/cupsmanager');
	var Hoek = require('hoek');
	var Joi = require('joi');

	var routeConfig = {
		method: 'GET',
		handler: function (request, reply) {
			Promise.resolve(new CupsManager()).then(function(cManager){
				var limit = request.params.limit || 25;
				cManager.getContestants(request.params.game, request.params.zone, limit)
					.then(function(teams){
						reply(JSON.stringify(teams))
						.type('application/json');
					}).catch(function(reason){
						reply(reason);
					});
			});
		},
		config: {
			// request params validation
			validate: {
				params: {
					game: Joi.string(),
					zone: Joi.string().regex(/^(europe|north-america|anz)$/i),
					limit: Joi.number().optional(),
				}
			}
		}
	};

	module.exports = [
		// applying new routes
		Hoek.applyToDefaults(routeConfig, {
			path: "/cups/{game}/{zone}"
		}),
		Hoek.applyToDefaults(routeConfig, {
			path: "/cups/{game}/{zone}/limit/{limit?}"
		}),
	];

})();
