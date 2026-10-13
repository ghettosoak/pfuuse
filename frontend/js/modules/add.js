$(function($){
	var $viewer = $('.viewer_view'),
		$interior = $viewer.find('.viewer_view_interior'),
		$title = $('.viewer_title');

	window.addCheck = function(callback){
		var offset = Math.abs($(this).scrollTop()),
			viewing = window.readr.viewing,
			loadBorder = (
				window.readr.list[viewing].offset + 
				(
					window.readr.list[viewing].height - 
					(window.outerHeight * 1.25)
				)
			);

		if (
			(offset > loadBorder) 
			&&
			(viewing !== window.readr.list.length - 1)
			&& 
			(!window.readr.list[viewing + 1].loaded) 
		){
			if (typeof(callback) === 'function')
				window.getArticle(window.readr.list[viewing + 1].url, viewing + 1, callback)
			else
				window.getArticle(window.readr.list[viewing + 1].url, viewing + 1)
		}
		else{
			if (typeof(callback) === 'function')
				callback();
		}

	};

	var addCheckDebounce = $$_.debounce(window.addCheck, 200);

	$viewer.scroll(addCheckDebounce);
});
