$(function($){

	var $viewer = $('.viewer_view'),
		$interior = $viewer.find('.viewer_view_interior'),
		$title = $('.viewer_header_title'),
		$list_progress = $('.viewer_list_progress span')

	window.follower = function(){
		offset = Math.abs($(this).scrollTop());

		for (var i = 0; i < window.readr.list.length; i++){

			var articleBegin = window.readr.list[i].offset;
			var articleEnd = articleBegin + window.readr.list[i].height;

			if (
				offset >= articleBegin &&
				offset <= articleEnd && 
				i !== window.readr.viewing
			){
				window.readr.viewing = i;
				window.readr.list[i].read = true;

				$title.html(window.readr.list[i].title);

				$('.viewer_list_visible .nav[data-number="' + window.readr.viewing + '"]')
					.addClass('active')
					.prevAll('read');

				$('.ctrl.full').attr('href', window.readr.list[window.readr.viewing].url)

				$list_progress.css('top', function(){
					return ( ( ( window.readr.viewing + 1 ) / ( window.readr.list.length + 1 ) ) * 100) + '%';
				});

				break;
			}
		}
	};

	var followerDebouncer = $$_.debounce(window.follower, 200);

	$viewer.on('scroll', followerDebouncer);

});

