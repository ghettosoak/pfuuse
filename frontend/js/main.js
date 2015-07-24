// Vendor files
// var $ = window.jQuery = window.$ = require('./vendor/jquery-1.11.1.min');
var $ = window.jQuery = window.$ = require('jQuery');

var $$_ = window.$$_ = require('./shared/core'); 

window.Handlebars = require('handlebars');

// require('./vendor/slip');
// require('jquery-ui/sortable'); 
require('./vendor/jquery-ui.min');
require('./vendor/jquery.ui.touch-punch');
// require('./vendor/jquery.pep');

// require('./vendor/handlebars-v3.0.3'); 

require('./modules/list'); 
require('./modules/selector'); 
require('./modules/gather'); 

require('./modules/article');

require('./modules/waypoints');
require('./modules/follow');
require('./modules/progress_article');
require('./modules/scrolling');

require('./modules/viewing_list');
require('./modules/add');
require('./modules/save');

require('./modules/inbetween');
require('./modules/stateChange');
require('./modules/homeScreener');


if (window.navigator.standalone){
	require('./vendor/iscroll-lite');
}else{
	$('body').addClass('standard');
}


// globals

window.readr = {
	list: [],
	viewing: -1,
	saveQuery: -1,
	saveList: {},
};

window.apiTarget = window.location.hostname === 'localhost' ? 'http://127.0.0.1:5000' : 'http://read.ject.ch';

// init some things
$(function($){

	$('.viewer').on('click', '.article .content a', function(e){
		e.preventDefault();
		var win = window.open($(this).attr('href'), '_blank');
		win.focus();
	});

	
});

// template for new JS files, a la browserify
$(function($){
	
});





