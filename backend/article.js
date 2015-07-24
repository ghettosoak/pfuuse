var request = require('request'),
	cheerio = require('cheerio')
	result = require('./fake/readable_fakeresults_1.js'),


_parse = function(url, callback){
    request({
		url: 'https://readability.com/api/content/v1/parser?url=' + url + '?currentPage=all&token=6047d163bdb1206f972f1fbee02325534f70dafa',
	    json: true
	}, function (error, response, body) {

		if (!error && response.statusCode === 200) {

			var body = body;

			body.content = body.content.replace(/(class="(.*?)")/g, '');

			callback(body)
		}

	});
}

parse = function(url, callback){
	 callback(result.results)
}

module.exports = (function() {
	return {
		parse: _parse
	};
})();















