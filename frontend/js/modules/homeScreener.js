$(function($){

	if (navigator.userAgent.match(/iPad|iPhone|iPod/g)){
			// is ios
		if ( !window.navigator.standalone && !$$_.readCookie('homescreen') ) {
			// we're in safari, show the homescreen bit 

			$('.homescreener img').each(function(){
				var $that = $(this);

				$that.attr('src',
					$that.attr('data-src')
				);
			});

			setTimeout(function(){
				$('body').addClass('homescreening');
			}, 500);
		}
	}else{
		// not on ios, add transitions!
		$('body').addClass('transition');
	}

	$('.homescreener_close').on('click', function(){
		$('body').removeClass('homescreening')
			.addClass('transition');

		$$_.createCookie('homescreen', 'true');
	});

// $('body').addClass('transition');

// alert('yeah!')

});