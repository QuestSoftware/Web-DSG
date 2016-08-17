require('dotenv').config({
	path: '../.env'
});

var frontifyApi = require('@frontify/frontify-api');

frontifyApi
	.syncPatterns({
		access_token: process.env.FRONTIFY_ACCESS_TOKEN,
		project: process.env.FRONTIFY_ACCESS_TOKEN
	}, ['../widgets/atoms/**/*-frontify.json'])
	.catch(function (err) {
		console.error(err);
	});