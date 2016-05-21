(function() {
	'use strict';

	var Hapi = require('hapi');
	var server = new Hapi.Server();
	var http = require('http');

	server.connection({
		port: 1337
	});


	server.route({
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			console.log('request');

			getCups().then(function(cups){

				var promises = [];
				if(cups){
					for (var id in cups){
						var cup = cups[id];
						if(!teams[cup.teamSize]){
							teams[cup.teamSize] = {};
						}
						promises.push(getTeams(cup, teams[cup.teamSize]));
					}

				}
				Promise.all(promises).then(function(){
					reply(teams);
				});
			});
		}
	});

	var teams = {};
	function getCups(data){
		console.log('getting cups');
		var promise = new Promise(function(resolve, reject){
			var cupsUrl = 'http://play.eslgaming.com/api/leagues?types=cup&states=finished&limit.total=25&path=%2Fplay%2Fworldoftanks%2Feurope%2F';
			return http.get(cupsUrl, function(response){
				// Continuously update stream with data
				var body = '';
				response.on('data', function(d) {
					body += d;
				});
				response.on('end', function() {
					// Data reception is done, do whatever with it!
					var cups = JSON.parse(body);
					resolve(cups);
				});

			}).on('error', function(error){
				console.error(error);
			});
		});
		return promise;
	}

	function getTeams(cup, teams){
		console.log('getting teams for cup: ' + cup.id);
		return new Promise(function(resolve, reject){
			var leagueUrl = 'http://play.eslgaming.com/api/leagues/:id/ranking?limit=25';
			leagueUrl = leagueUrl.replace(':id', cup.id);
			return http.get(leagueUrl, function(response){
				if(response.statusCode === 200){
					// Continuously update stream with data
					var body = '';
					response.on('data', function(d) {
						body += d;
					});

					response.on('end', function() {
						// Data reception is done, do whatever with it!
						var cupdata = JSON.parse(body);
						var ranking = cupdata.ranking;
						if(ranking){
							for (var rank in ranking){
								var team = ranking[rank];
								if(!teams[team.team.id]){
									teams[team.team.id] = {
										'cupsPlayed': 1,
										'bestPosition': team.position,
										'worstPosition': team.position,
									};
								} else{
									teams[team.team.id].cupsPlayed++;
									if(team.position < teams[team.team.id].bestPosition){
										teams[team.team.id].bestPosition = team.position;
									}
									if(team.position > teams[team.team.id].worstPosition){
										teams[team.team.id].worstPosition = team.position;
									}
								}
							}
						}
					});
				}

				resolve();
			}).on('error', function(error){
				reject(error);
			});
		});
	}

	server.start(function(error){
		if (error) {
			throw error;
		}
		console.log('[Server]', 'Server started at: ' + server.info.uri);
	});


})();
