$(function($){
	window.getList = function(){
		$('body').addClass('loading');

		$.ajax({
			method: 'GET',
			url: window.apiTarget + '/api/list'
		})
		.done(function( response ) {
			$$_.render('result', response, function(returned){
				$('.browser_interior').append(returned);

				setTimeout(function(){
					$('body').attr('data-location', 'browser')
						.removeClass('loading');

					// if (window.navigator.standalone){
						window.browserScroll = new IScroll('.browser', { click: true });
					// }
				}, 1000);

			});
		});
	};
});
