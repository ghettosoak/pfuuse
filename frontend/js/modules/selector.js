$(function($){
	var order = 0;

	$('body').on('click', '.result', function(){
		var $that = $(this);

		$that.toggleClass('selected')

		if ( $that.hasClass('selected') ){
			$that.attr('data-order', order++)
		}else{
			$that.attr('data-order', '')
			order--;		
		}

	});
});
