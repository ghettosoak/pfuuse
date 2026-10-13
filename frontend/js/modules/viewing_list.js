$(function($){
	var $viewer_container = $('.viewer');

	$('.viewer_ctrl .menu, .viewer_list_opener_desktop').on('click', function(){
		$viewer_container.toggleClass('list');
	});	

	window.navinit = function(){

		// as usual, massive thanks for mr. coyier :)
		// https://css-tricks.com/draggable-elements-push-others-way/

		$(".nav").each(function(i) {
			var item = $(this);
			var item_clone = item.clone();
			item.data("clone", item_clone);
			var position = item.position();

			item_clone.css({
				left: position.left,
				top: position.top,
				visibility: "hidden"
			})
			.attr("data-pos", i + 1);

		  $('.viewer_list_clone').append(item_clone);
		});

		$(".viewer_list_visible").sortable({

			axis: "y",
			revert: true,
			scroll: false,
			placeholder: "nav-placeholder",
			cursor: "move",
			handle: ".grab",
			cancel: ".read",

			start: function(e, ui) {
				ui.helper.addClass("exclude-me");
				$(".viewer_list_visible .nav:not(.exclude-me)")
					.css("visibility", "hidden");
				ui.helper.data("clone").hide();
				$(".viewer_list_clone .nav").css("visibility", "visible");
			},

			change: function(e, ui) {
				$(".viewer_list_visible .nav:not(.exclude-me)").each(function() {
					var item = $(this);
					var clone = item.data("clone");
					clone.stop(true, false);
					var position = item.position();

					clone.animate({
						left: position.left,
						top: position.top
					}, 200);
				});
			},

			stop: function(e, ui) {
				$(".viewer_list_visible .nav.exclude-me").each(function() {
					var item = $(this),
						clone = item.data("clone"),
						position = item.position();

					clone.css("left", position.left);
					clone.css("top", position.top);
					clone.show();

					item.removeClass("exclude-me");
				});

				$(".viewer_list_visible .nav").each(function() {
					var item = $(this),
						clone = item.data("clone");

					clone.attr("data-pos", item.index());
				});

				$(".viewer_list_visible .nav").css("visibility", "visible");
				$(".viewer_list_clone .nav").css("visibility", "hidden");

				setTimeout(reorder, 500);
			},
			
		});

		var sliders = [];

		$('.slide').each(function(e){

			$(this).draggable({
				axis: "x",
				handle: 'p',
				start: function(event, ui) {
					var $that = $(this);

					$that.removeClass('open');
				},
				stop: function(event, ui) {

					console.log(ui.position.left)
					
					var $that = $(this);

					$that.css('left', 0);

					if(ui.position.left < -75){
						$that.addClass('open');
					}
					else if(ui.position.left < 0){
						$that.removeClass('open');
					}                      
				}
			}).on('click', function(){
				$(this).removeClass('open');
			});
		});

		$('.nav_ctrl_delete').on('click', function(){
			removeArticle( $(this).parents('.nav').attr('data-number') );
		});

		$('.nav_ctrl_save').on('click', function(){
			window.saveThisOne( $(this).parents('.nav').attr('data-number') );
		});

		$('.nav_ctrl_read').on('click', function(){
			readThisOne( $(this).parents('.nav').attr('data-number') );
		});
	};


	reorder = function(){
		var $list = $('.viewer_list_visible'),
			newOrder = [],
			listCopy = JSON.parse( JSON.stringify( window.readr.list ) );

		$list.find('.nav').each(function(e){
			newOrder.push($(this).attr('data-number'));
		});

		for (var i = 0; i < listCopy.length; i++){
			window.readr.list[i] = JSON.parse( JSON.stringify( listCopy[ newOrder[ i ] ] ) )
		}

		$list.find('.nav').each(function(e){
			$(this).attr('data-number', e);
		});
	},

	removeArticle = function(index){
		$('.viewer_list_visible .nav[data-number="' + index + '"]').remove();
		$('.viewer_list_clone .nav[data-number="' + index + '"]').remove();

		window.readr.list.splice(index, 1);
		reorder();
	},
	// [data-number="' + window.readr.viewing + '""]'

	readThisOne = function(index){
		$('.viewer_list_visible .nav[data-number="' + index + '"]').find('.slide').removeClass('open')

		$('.viewer_list_visible .nav[data-number="' + index + '"]').insertAfter(
			$('.viewer_list_visible .nav[data-number="' + window.readr.viewing + '"]')
		);

		$('.viewer_list_clone .nav[data-number="' + index + '"]').insertAfter(
			$('.viewer_list_clone .nav[data-number="' + window.readr.viewing + '"]')
		);


		navOffset = $('.viewer_list_visible .nav[data-number="' + window.readr.viewing + '"]')
			.position().top - 100

		$$_.scrollNav(navOffset);

		reorder();

		window.addCheck(function(){
			setTimeout(function(){
				$viewer_container.removeClass('list');
				setTimeout(function(){
					$$_.scrollViewer( 
						window.readr.list[window.readr.viewing].offset + 
						window.readr.list[window.readr.viewing].height 
					);
				}, 500);
			}, 500);
		});
	}
});


