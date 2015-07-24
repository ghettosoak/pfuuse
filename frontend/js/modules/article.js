$(function($){

	var first = true;

	window.getArticle = function(url, index, callback){
		$.ajax({
			method: 'POST',
			url: window.apiTarget + '/api/view/',
			data: {
				url: url,
				origin: window.readr.list[index].origin
			}
		})
		.done(function( response ) {
			var renderOption;
			console.log(response)
			if (window.readr.list[index].origin === 'so')
				renderOption = 'question';
			else
				renderOption = 'article';

			$$_.render(renderOption, {
				number: index,
				saved: !$.isEmptyObject(window.readr.list[index].saved),
				origin: window.readr.list[index].origin,
				article: response,
			}, function(returned){ 
				$('.viewer_view_interior').append( returned )

				$('body').attr('data-location', 'view')
					.removeClass('loading');

				window.readr.list[index].loaded = true;

				setTimeout(window.waypoints, 100);

				if (first){
					setTimeout(window.follower, 200);

					if (window.navigator.standalone){
						window.browserScroll = new IScroll('.viewer_view', { click: true });
					}
				}

				first = false;

				setTimeout(callback, 300);
			});
		});
	}

	Handlebars.registerHelper('truncator', function(text) {
		$text = $(text).text()
		return $text.substring(0, 150);
	});

	$('.viewer_view_interior').on('click', '.expander', function(){
		var $that = $(this)
		$that.addClass('expansion')
			.find('.interior').css('min-height', function(){
				return $that.find('.expanded').outerHeight(true)
			});

		setTimeout(window.waypoints, 100);
	});
	
});
