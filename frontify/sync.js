var frontifyApi = require('@frontify/frontify-api');

frontifyApi
	.syncPatterns({
		access_token: '0400bc2ed9a5ea9783ba6045ccbef6e37ccf4a19',
		project: 94987
	}, ['../widgets/**/*-frontify.json'])
	.catch(function (err) {
		console.error(err);
	});