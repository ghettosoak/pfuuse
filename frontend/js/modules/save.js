$(function($){

	var $viewer = $('.viewer');

	$('.ctrl.save').on('click', function(){
		window.saveThisOne(window.readr.viewing);
	});

	window.saveThisOne = function(index){
		$viewer.addClass('save');
		window.readr.saveQuery = index;

		if (!$.isEmptyObject(window.readr.list[window.readr.saveQuery].saved)){
			$('.viewer_save_select_option').each(function(e){
				var $that = $(this);
				for (var i in window.readr.list[window.readr.saveQuery].saved){
					if ($that.attr('data-option') === i)
						$that.addClass('added');
				}
			})
		}else{
			$('.viewer_save_select_option').removeClass('added');
		}
	}

	$('.viewer_save_select_option').on('click', function(e){
		e.stopPropagation();

		var $that = $(this),
			option = $that.data('option'),
			queryIndex = window.readr.saveQuery;

		if (typeof(window.readr.saveList[queryIndex]) !== 'array'){
			window.readr.saveList[option] = [];
		}

		window.readr.saveList[option].push({
			url: encodeURIComponent(window.readr.list[queryIndex].url),
			title: window.readr.list[queryIndex].title,
		});

		window.readr.list[queryIndex].saved[option] = true;

		$('.nav[data-number="' + queryIndex + '"]').addClass('saved');

		$that.addClass('added');

		$viewer.addClass('to_send');

		setTimeout(function(){
			$viewer.removeClass('save');
		}, 500);

	});


	$('.viewer_save_select_command').on('click', function(e){
		e.stopPropagation();
		
		if ( $(this).data('command') === 'send' )
			window.fireAtWill();

		$viewer.removeClass('save');
	});

	$('.viewer_view_finish').on('click', function(){		
		if ($viewer.hasClass('to_send')){
			window.fireAtWill();

			$viewer.removeClass('to_send');
		}
	})

	window.fireAtWill = function(){
		$.ajax({
			method: 'POST',
			url: window.apiTarget + '/api/send/',
			data: {
				list: window.readr.saveList,
				time: new Date()
			},
		})
		.done(function(response){
			$viewer.addClass('save_confirmed')
			
			setTimeout(function(){
				$viewer.removeClass('save_confirmed')
			}, 3000);
		});
	}

	$('.viewer_save_select_exterior').on('click', function(){
		$viewer.removeClass('save');
	})
	
});


