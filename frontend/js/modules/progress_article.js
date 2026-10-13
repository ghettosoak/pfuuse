$(function($){
	var $viewer = $('.viewer_view'),
		$progressBar = $('#viewer_header_progress');

	window.progress = function(){
		var offset = $(this).scrollTop(),
			begin = window.readr.list[window.readr.viewing].offset,
			end = begin + window.readr.list[window.readr.viewing].height,

			width = Math.floor($$_.map_range(offset, begin, end, 0, 100));

		$progressBar.css('width', width + '%');
	};

	$viewer.on('touchmove', window.progress);
	$viewer.on('scroll', window.progress);

});