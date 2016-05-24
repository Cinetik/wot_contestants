(function (){
	'use strict';

	var http = require('http');
	var url = require('url');
	var config = require('config');
	/**
	 * Cups manager handles queries to ESL API and return proper results
	 "
	 * @constructor
	 */
	function CupsManager(){
			if(!config.has('ESLAPI.host')){
				throw 'No configured host';
			}
			this.host = config.get('ESLAPI.host');
			this.apiPath = config.get('ESLAPI.apiPath') + '/leagues';
			// These we could default as it's a public api
			this.protocol = config.get('ESLAPI.protocol') || 'http';
			this.port = config.get('ESLAPI.port') || 80;
	}

	/**
	 * GetAll function returns every cup for a game in a zone from ESL API
	 * @param Sring game - game to look for
	 * @param Sring zone - world zone to look for
	 * @param Integer limit - search result limit
	 * @return Promise object
	 */
	CupsManager.prototype.getAll = function (game, zone, limit){
		var self = this;
		// Construct query url
		var fullUrl = url.format({
			protocol: 'http:',
			host: this.host,
			pathname: this.apiPath,
			query: {
				'types': 'cup',
				'states': 'finished',
				'limit.total': limit,
				'path': '/play/'+ game +'/' + zone +'/',
			}
		});

		return new Promise(function(resolve, reject){
			return http.get(fullUrl, function(response){
				if(response.statusCode === 200){
					// Continuously update stream with data
					var body = '';
					response.on('data', function(d) {
						body += d;
					});
					response.on('end', function() {
						// Data reception is done, do whatever with it!
						var cups = JSON.parse(body);
						if (cups){
							resolve(cups);
						}
						else {
							reject('Error retrieving cups');
						}
					});
				} else {
					reject('Error while retrieving cups: got HTTP Status Code ' + response.statusCode);
				}
			}).on('error', function(error){
				reject('Error retrieving cups:' + error);
			});
		});
	};

	/**
	 * Get function return cup details based on cup ID
	 * @param Object cup - Object returned by ESL API
	 * @return Promise object
	 */
	CupsManager.prototype.get = function(cup){
		var self = this;
		var fullUrl = url.format({
			protocol: 'http:',
			host: this.host,
			pathname: this.apiPath + '/' + cup.id + '/ranking',
			query: {
				'limit': 25,
			}
		});
		return new Promise(function(resolve, reject){
			return http.get(fullUrl, function(response){
				if(response.statusCode === 200){
					// Continuously update stream with data
					var body = '';
					response.on('data', function(d) {
						body += d;
					});

					response.on('end', function() {
						// Data reception is done, do whatever with it!
						var cupdata = JSON.parse(body);
						if(cupdata){
							// adding teamSize to data to group later when returning data
							cupdata.teamSize = cup.teamSize;
							resolve(cupdata);
						}
						else {
							reject('Error retrieving cups:' + error);
						}
					});
				} else {
					reject('Error while retrieving cups: got HTTP Status Code ' + response.statusCode);
				}
			}).on('error', function(error){
				reject(error);
			});
		});
	};

	/**
	 *	Wrapper method to process contestants from game cups in a zone
	 * @param Sring game - game to look for
	 * @param Sring zone - world zone to look for
	 * @param Integer limitResults - search result limit
	 * @return Promise object
	 */
	CupsManager.prototype.getContestants = function(game, zone, limitResults){
		var self = this;
		var teams = {};
		var limit = limitResults || 25; // default to 25
		return self.getAll(game, zone, limit).then(function(cups){
			var promises = [];
			if(cups){
				for (var id in cups){
					if (!teams[cups[id].teamSize]){
						teams[cups[id].teamSize] = {};
					}
					promises.push(self.get(cups[id]));
				}
			}
			return Promise.all(promises).then(function(cups){
				// processing ranking in every cups
				cups.map(function(cup){
					var ranking = cup.ranking;
					if(ranking){
						for (var rank in ranking){ // could be a .map
							var team = ranking[rank].team;
							var position = ranking[rank].position;
							if(!teams[cup.teamSize][team.id]){
								teams[cup.teamSize][team.id] = {
									cupsPlayed: 1,
									bestPosition: position,
									worstPosition: position,
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
				return teams;
			});
		});
	};

	module.exports = CupsManager;
})();
