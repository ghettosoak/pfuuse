$(function($){

	$('.hello_go').on('click', function(){
		window.getList();
	});

	$('.about_opener').on('click', function(){
		$('body').addClass('what');
	});

	$('.about_close').on('click', function(){
		$('body').removeClass('what');
	})

});