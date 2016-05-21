(function(){
	'use strict';
	var CupsManager = require('../managers/cupsmanager');
	var Hoek = require('hoek');
	var Joi = require('joi');

	var routeConfig =
	{
		method: 'GET',
		handler: function (request, reply) {
			Promise.resolve(new CupsManager()).then(function(cManager){
				var teams = {};
				var limit = request.params.limit || 25; // default to 25
				cManager.getAll(request.params.game, request.params.zone, limit).then(function(cups){
					var promises = [];
					if(cups){
						for (var id in cups){
							if (!teams[cups[id].teamSize]){
								teams[cups[id].teamSize] = {};
							}
							promises.push(cManager.get(cups[id]));
						}
					}
					Promise.all(promises).then(function(cups){
						// processing ranking in every cups
						cups.map(function(cup){
							var ranking = cup.ranking;
							if(ranking){
								for (var rank in ranking){ // could be a .map
									var team = ranking[rank].team;
									var position = ranking[rank].position;
									if(!teams[cup.teamSize][team.id]){
										teams[cup.teamSize][team.id] = {
											'cupsPlayed': 1,
											'bestPosition': position,
											'worstPosition': position,
										};
									} else {
										teams[cup.teamSize][team.id].cupsPlayed++;
										if(position < teams[cup.teamSize][team.id].bestPosition){
											teams[cup.teamSize][team.id].bestPosition = position;
										}
										if(position > teams[cup.teamSize][team.id].worstPosition){
											teams[cup.teamSize][team.id].worstPosition = position;
										}
									}
								}
							}
						});
						reply(teams);
					});
				}).catch(function(error){
					reply('Error while retrieving cups', error);
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
