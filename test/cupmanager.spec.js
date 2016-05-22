(function(){
	'use strict';

	var CupsManager = require('../managers/cupsmanager');
	var nock = require('nock');
	var Code = require('code');
	var Lab = require('lab');
 	var lab = exports.lab = Lab.script();
	var fs = require('fs');

	var expect = Code.expect;
	var describe = lab.experiment;
	var it = lab.test;
	var before = lab.before;
	var after = lab.after;

	describe('CupsManager', function(){
		var cManager = new CupsManager();

		it('should get cups from a game and zone', function(done){

			nock('http://play.eslgaming.com')
				.get('/api/leagues?types=cup&states=finished&limit.total=25&path=%2Fplay%2Fworldoftanks%2Feurope%2F')
				.replyWithFile(200, __dirname + '/cups.json');

			cManager.getAll('worldoftanks', 'europe', 25).then(function(data){
				expect(data).to.be.an.object();
				fs.readFile(__dirname + '/cups.json', function(err, file){
					expect(data).to.equal(file);
				});

				done();
			}).catch(done);

		});

		it('should get cup information from an id', function(done){
			nock('http://play.eslgaming.com')
				.get('/api/leagues/' + 136085 + '/ranking?limit=25')
				.replyWithFile(200, __dirname + '/cup.json');
			var cup = {id: "136085", teamSize: 3};
			cManager.get(cup).then(function(data){
				expect(data).to.be.an.object();
				fs.readFile(__dirname + '/cup.json', function(err, file){
					expect(data).to.equal(file);
				});

				done();
			}).catch(done);
		});

	});

})();
