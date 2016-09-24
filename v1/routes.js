/**
 * Establishing the routes / API's for this server
 */

var App = require("../core");
var _ =  require("underscore");
var errorHandling = require("./errorHandling");
var tokens = require("../tokens");
var config = require("../config").v1;

var shell = require('shelljs');
shell.echo('Starting VR API Server');

var appsObserver = require('./apps-observer');

var cp = require('child_process');
var exe = require('path').normalize('./vendor/WinSendKeys/WinSendKeys.exe');

module.exports = function() {
	var model = require("./model")();
		
	// var steamPath = '"c:\\Program Files (x86)\\Steam\\steam"';
	var steamPath = 'steam';


	App.Express.get("/:version/ping", function(req, res) {
		try {
			console.info('test1');

			appsObserver.observeApp();

			res.send('test ' + steamPath);
		} catch(e) {
			console.error('catch ', e);
			errorHandling.handle(e, res);
		}
	});

	App.Express.get("/:version/restartSteam", function(req, res) {
		try {
			toLeft();
			console.info('#### request', req);

			var kill = 'taskkill /f /im steam*';
			console.info('killing steam cmd ' + kill);

			shell.exec(kill, {async: false});
			
			console.info('steam killed');

			var run = 'steam';
			run = steamPath;
			console.info('run steam cmd '+run);

			shell.exec(run, {async: true});

			console.info('steam starting up');

			res.send(kill + ' !!!! ' + run);

		} catch(e) {
			console.error('catch ', e);
			errorHandling.handle(e, res);
		}
	});


	App.Express.get("/:version/play", function (req, res) {
		try {
			console.info('play');


			res.send('play');

		} catch (e) {
			errorHandling.handle(e, res);
		}
	});

	App.Express.get("/:version/video", function (req, res) {
		var windowName = req.body.app || req.query.app || '[ACTIVE]';
		var keyStrokes = req.body.keys || req.query.keys || '';
		var keyStrokes = '^#{RIGHT}';

		console.log('keys' + keyStrokes);
		if (keyStrokes === '') {
			res.status(400).json({ error: 'message' });
		} else {
			var keys = keyStrokes.replace('^','^^');

			keys = '"'+keys+'"';

			var cmd = [exe,'-w',windowName,keys].join(' ');

			cp.exec(cmd, function(err, stdout, stderr) {
				if (err) {
					res.status(400).json({ error: 'message' });
				} else {
					res.json({ success: 'message', received: keyStrokes, encoded: keys });
				}
			});
		}
	});

	function toLeft() {
		var windowName = '[ACTIVE]';
		var keyStrokes = '^#{LEFT}';

		console.log('keys' + keyStrokes);
		if (keyStrokes === '') {
			res.status(400).json({ error: 'message' });
		} else {
			var keys = keyStrokes.replace('^','^^');

			keys = '"'+keys+'"';

			var cmd = [exe,'-w',windowName,keys].join(' ');

			cp.exec(cmd, function(err, stdout, stderr) { 
				console.log('to left done');
			});
		}
	}

	App.Express.get("/:version/sendKeys", function (req, res) {
		toLeft();
		var windowName = req.body.app || req.query.app || '[ACTIVE]';
		// var windowName = 'Video.UI.exe';
		var keyStrokes = req.body.keys || req.query.keys || '';
		console.log('keys' + keyStrokes);
		if (keyStrokes === '') {
			res.status(400).json({ error: 'message' });
		} else {
			var keys = keyStrokes.replace('^','^^');

			keys = '"'+keys+'"';

			//keys = keys.replace(/{[^}]*}/g, function(r) {  // Add quotes around commands with whitespace
			//return '"'+r+'"';
			//return r.replace(/\s+/g,'\\\ ');
			//});

			var cmd = [exe,'-w',windowName,keys].join(' ');

			cp.exec(cmd, function(err, stdout, stderr) {
				if (err) {
					res.status(400).json({ error: 'message' });
				} else {
					res.json({ success: 'message', received: keyStrokes, encoded: keys });
				}
			});

		}
	});

	App.Express.get("/:version/startSteam", function(req, res) {
		try {
			toLeft();
			console.info('startSteam.');
			var run = steamPath;
			console.log('run steam cmd '+run);
			shell.exec(run, {async: true});
			console.log('steam starting up');

			res.send(run);

		} catch(e) {
			errorHandling.handle(e, res);
		}

	});

	App.Express.get("/:version/steam", function(req, res) {
		try {
			toLeft();

			// var steamPath = 'steam';
			var steamPath = '"c:\\Program Files (x86)\\Steam\\steam"';

			var cmd = steamPath + ' ' + req.query.cmd;

			res.send('steam ' + req.query.cmd);

			console.log(cmd);
			shell.exec(cmd, {async: true});
			// shell.echo('game ' + req.params.employeeId + 'started');
			res.send('steam ' + req.query.cmd);

			appsObserver.observeConfig(cmd);

		} catch(e) {
			errorHandling.handle(e, res);
		}
	});

	App.Express.get("/:version/startGame", function(req, res) {
		try {
			// toLeft();
			// console.log(req);
			var game = req.query.game;
			appsObserver.observeConfig(game);
			res.send('game started ', game);
		} catch(e) {
			errorHandling.handle(e, res);
		}
	});

	App.Express.get("/:version/cmd", function(req, res) {
		try {
			toLeft();
			var cmd = req.query.cmd;
			console.log('Execute Command\n', cmd);
			shell.exec(cmd, {async: false});
			// shell.echo('game ' + req.params.employeeId + 'started');
			res.send(cmd);

		} catch(e) {
			errorHandling.handle(e, res);
		}
	});

	// Validate token in routine
	function validateToken(req, res, next) {
		// Handle secret admin access
		if(config.adminKeyEnabled && req.query.secret_admin === config.adminKey) {
			next();
		} else {
			try {
				if(!req.headers.api_token) {
					throw { code: "NO_TOKEN" };
				}

				if(!req.headers.api_secret) {
					throw { code: "NO_TOKEN" };
				}

				if(!tokens[req.headers.api_token]) {
					throw { code: "INVALID_TOKEN" };
				}

				if(!tokens[req.headers.api_token].secret !== req.headers.api_secret) {
					throw { code: "INVALID_TOKEN" };
				}

				next();
			} catch(e) {
				errorHandling.handle(e, res);
			}
		}
	}

	/**
	 * @api {get} /employees/ Get all employees
	 * @apiVersion 1.0.0
	 * @apiGroup Employees
	 * @apiName GetEmployees
	 * @apiDescription Returns a list of all employees
	 *
	 * @apiExample Example usage:
	 *     http://api.yourapp.com/1/employees
	 *
	 * @apiParam (Headers) {String} api_token The API token assigned to your app
	 * @apiParam (Headers) {String} api_secret The API secret assigned to your app
	 *
	 * @apiSuccess {Boolean} success Success / Failure flag on data returned
	 * @apiSuccess {Number} numberOfRecords The number of records in the results
	 * @apiSuccess {Array} results The available results
	 *
	 * @apiSuccessExample Success-Response:
	 * HTTP/1.1 200 OK
	 *  {
			"success": true,
			"numberOfRecords": 1,
			"results": [{
				"id": 12345,
				"firstname": "John",
				"lastname": "Doe",
				"position": "Architect"
			}]
	 *  }
	 */
	App.Express.get("/:version/employees", validateToken, function (req, res) {
		model.retrieve("employees", function(_response) {
			if(!_response.success) {
				errorHandling.handle(_response.error, res);
			} else {
				res.send(_response);
			}
		});
	});

	/**
	 * @api {get} /employees/:employeeId Get employee by ID
	 * @apiVersion 1.0.0
	 * @apiGroup Employees
	 * @apiName GetEmployeeByID
	 * @apiDescription Returns the desired employee
	 *
	 * @apiExample Example usage:
	 *     http://api.yourapp.com/1/employee/102
	 *
	 * @apiParam (Headers) {String} api_token The API token assigned to your app
	 * @apiParam (Headers) {String} api_secret The API secret assigned to your app
	 *
	 * @apiSuccess {Boolean} success Success / Failure flag on data returned
	 * @apiSuccess {Object} results The available results
	 *
	 * @apiSuccessExample Success-Response:
	 * HTTP/1.1 200 OK
	 *  {
			"success": true,
			"numberOfRecords": 1,
			"results": {
				"id": 12345,
				"firstname": "John",
				"lastname": "Doe",
				"position": "Architect"
			}
	 *  }
	 *
	 * @apiParam (Endpoint) {Number} employeeId The employee ID
	 */

	// //http://store.steampowered.com/app/496920/
	// App.Express.get("/:version/employees/:employeeId", validateToken, function(req, res) {
	// 	try {
	// 		if(!req.params.employeeId) {
	// 			throw { code: "NO_EMPLOYEE_ID" };
	// 		}
	// 		shell.echo('starting the game ' + req.params.employeeId);

	// 		// var steamPath = 'steam';
	// 		var steamPath = '"c:\\Program Files (x86)\\Steam\\steam"';
	// 		var cmd = steamPath + ' -applaunch ' + req.params.employeeId;

	// 		// var cmd = 'steam -applaunch ' + req.params.employeeId;
	// 		console.log(cmd);
	// 		shell.exec(cmd);
	// 		shell.echo('game ' + req.params.employeeId + 'started');
	// 		res.send('start game ' + req.params.employeeId);

	// 	} catch(e) {
	// 		errorHandling.handle(e, res);
	// 	}
	// });



};