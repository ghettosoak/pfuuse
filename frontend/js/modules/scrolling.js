$(function($){
	$('.viewer_header').on('click', function(){
		var target = window.readr.list[window.readr.viewing].offset;
		$$_.scrollViewer(target);
	});

	$('.ctrl.prev').on('click', function(){
		var target = window.readr.list[window.readr.viewing - 1].offset;
		$$_.scrollViewer(target);
	});
	
	$('.ctrl.next').on('click', function(){
		if (
			(!window.readr.list[window.readr.viewing + 1].loaded)
			&&
			(window.readr.viewing !== window.readr.list.length - 1)
			&& 
			(!window.readr.list[window.readr.viewing + 1].loaded) 	
		){
			window.getArticle(
				window.readr.list[window.readr.viewing + 1].url, 
				window.readr.viewing + 1,
				function(){
					var target = window.readr.list[window.readr.viewing + 1].offset;
					$$_.scrollViewer(target, window.progress);
				}
			)
		}else{
			var target = window.readr.list[window.readr.viewing + 1].offset;
			$$_.scrollViewer(target, window.progress);
		}
	});
});