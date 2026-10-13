$(function($){

	window.readr.list = [];

	var gather = function(){

		var selected = $('.browser').find('.selected').sort(function(a,b){
			var an = a.getAttribute('data-order'),
				bn = b.getAttribute('data-order');

			if(an > bn) {
				return 1;
			}
			if(an < bn) {
				return -1;
			}
			return 0;
		});

		selected.each(function(e){
			var $that = $(this);
			
			window.readr.list[e] = {
				url: $that.data('url'),
				title: $that.html(),
				read: false,
				saved: {},
				origin: $that.parents('.result_exterior').data('origin')
			};

			$$_.render('nav', {
				title: window.readr.list[e].title,
				index: e
			}, function(returned){
				$('.viewer_list_visible').append(returned);
			}, e);
		});

		window.getArticle(window.readr.list[0].url, 0);

		$('body').addClass('loading');

		setTimeout(window.navinit, 500);
		
	}

	$('.gather').on('click', gather);

});
