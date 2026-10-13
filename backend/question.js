var request = require('request'),
	cheerio = require('cheerio'),

	parse = function(url, callback){

		request({
		    url: url,
		    json: true
		}, function (error, response, body) {

		    if (!error && response.statusCode === 200) {

		    	var questionPage = {
					queried: '',
					question: {
						title: '',
						text: '',
						comments: [
							// 'this is a comment',
							// 'this is another comment'
						]
					},
					answers: [
						// {
						// 	text: '',
						// 	comments:[]
						// }
					]
				};

		    	questionPage.queried = new Date();

		        var $ = cheerio.load(body);

		        questionPage.question.title = $('#question-header a').html();

		        questionPage.question.text = $('.question .post-text').html();
		        
		        $('.question .comment-copy').each(function(e){
		        	console.log(e)
		        	questionPage.question.comments.push(
		        		$(this).html().toString()
	        		);
		        });

		        $('.answer').each(function(e){
		        	var $that = $(this);

		        	questionPage.answers[e] = {};

		        	questionPage.answers[e].text = $that.find('.post-text').html();

		        	questionPage.answers[e].comments = [];

		        	$that.find('.comment-copy').each(function(){
		        		questionPage.answers[e].comments.push(
			        		$(this).html() 
	        			);
		        	});

		        	if (e === 4) return false;
		        });

		        callback(questionPage);
		    }
		});

	};

module.exports = (function() {
	return {
		parse: parse
	};
})();