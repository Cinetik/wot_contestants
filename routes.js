(function(){
	'use strict';
	var CupsManager = require('./cupsmanager');

	module.exports = [
		{
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			Promise.resolve(new CupsManager()).then(function(cManager){
				var teams = {};
				cManager.getAll().then(function(cups){
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
						cups.map(function(cup){
							var ranking = cup.ranking;
							if(ranking){
								for (var rank in ranking){
									var team = ranking[rank].team;
									var position = ranking[rank].position;
									if(!teams[cup.teamSize][team.id]){
										teams[cup.teamSize][team.id] = {
											'cupsPlayed': 1,
											'bestPosition': position,
											'worstPosition': position,
										};
									} else{
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
		}
	}
	];
})();
