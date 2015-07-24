$(function($){

	window.waypoints = function(){
		$('.article').each(function(e){
			window.readr.list[e].offset = $(this).position().top;
			window.readr.list[e].height = $(this).outerHeight(true);
		});
	}
});