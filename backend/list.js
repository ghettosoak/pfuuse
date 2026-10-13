var request = require('request'),
	cheerio = require('cheerio'),
	HN_results = require('./fake/HN_fakeresults.js'),
	DN_results = require('./fake/DN_fakeresults.js'),
	SO_results = require('./fake/SO_fakeresults.js'),

articleList = {},

HN_getStories = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty',
HN_getSingular_pre = 'https://hacker-news.firebaseio.com/v0/item/',
HN_getSingular_post = '.json?print=pretty',

DN_API = 'https://www.designernews.co/api/v2/stories',

SO_frontpage = 'http://stackexchange.com/',

_newList = function(){
	articleList = {
		HN: [],
		DN: [],
		SO: []
	}
},

// 	                                                                                                                         
// 	88                                88                                                                                     
// 	88                                88                                                                                     
// 	88                                88                                                                                     
// 	88,dPPYba,  ,adPPYYba,  ,adPPYba, 88   ,d8  ,adPPYba, 8b,dPPYba,    8b,dPPYba,   ,adPPYba, 8b      db      d8 ,adPPYba,  
// 	88P'    "8a ""     `Y8 a8"     "" 88 ,a8"  a8P_____88 88P'   "Y8    88P'   `"8a a8P_____88 `8b    d88b    d8' I8[    ""  
// 	88       88 ,adPPPPP88 8b         8888[    8PP""""""" 88            88       88 8PP"""""""  `8b  d8'`8b  d8'   `"Y8ba,   
// 	88       88 88,    ,88 "8a,   ,aa 88`"Yba, "8b,   ,aa 88            88       88 "8b,   ,aa   `8bd8'  `8bd8'   aa    ]8I  
// 	88       88 `"8bbdP"Y8  `"Ybbd8"' 88   `Y8a `"Ybbd8"' 88            88       88  `"Ybbd8"'     YP      YP     `"YbbdP"'  
// 	                                                                                                                         


_HN_getList = function(){

	request({
	    url: HN_getStories,
	    json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {

	    	articleList.HN = [];

	        for (var i = 0; i < 50; i++){
	        	HN_getArticle(body[i], i)
	        }
	    }
	});
},

HN_getList = function(){
	articleList.HN = HN_results.results;
},

HN_getArticle = function(ID, index){
	request({
	    url: HN_getSingular_pre + ID + HN_getSingular_post,
	    json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {

	        articleList.HN.push({
	        	title: body.title,
	        	url: body.url
	        })

	        // console.log(articleList)
	    }
	});
};


// 	                                                                                                                                             
// 	         88                      88                                                                                                          
// 	         88                      ""                                                                                                          
// 	         88                                                                                                                                  
// 	 ,adPPYb,88  ,adPPYba, ,adPPYba, 88  ,adPPYb,d8 8b,dPPYba,   ,adPPYba, 8b,dPPYba,    8b,dPPYba,   ,adPPYba, 8b      db      d8 ,adPPYba,     
// 	a8"    `Y88 a8P_____88 I8[    "" 88 a8"    `Y88 88P'   `"8a a8P_____88 88P'   "Y8    88P'   `"8a a8P_____88 `8b    d88b    d8' I8[    ""     
// 	8b       88 8PP"""""""  `"Y8ba,  88 8b       88 88       88 8PP""""""" 88            88       88 8PP"""""""  `8b  d8'`8b  d8'   `"Y8ba,      
// 	"8a,   ,d88 "8b,   ,aa aa    ]8I 88 "8a,   ,d88 88       88 "8b,   ,aa 88            88       88 "8b,   ,aa   `8bd8'  `8bd8'   aa    ]8I     
// 	 `"8bbdP"Y8  `"Ybbd8"' `"YbbdP"' 88  `"YbbdP"Y8 88       88  `"Ybbd8"' 88            88       88  `"Ybbd8"'     YP      YP     `"YbbdP"'     
// 	                                     aa,    ,88                                                                                              
// 	                                      "Y8bbdP"                                                                                               

_DN_getList = function(){

	request({
	    url: DN_API,
	    json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {

	    	articleList.DN = [];

	    	// console.log(body.stories)

	        for (var i = 0; i < body.stories.length; i++){

	        	articleList.DN.push({
	        		title: body.stories[i].title,
	        		url: body.stories[i].url
	        	})
	        }

	      	// console.log(articleList.DN);
	    }
	});
},

DN_getList = function(){
	articleList.DN = DN_results.results;
},

// 	                                                                                                                                              
// 	                                        88                                                            ad88 88                                 
// 	            ,d                          88                                                           d8"   88                                 
// 	            88                          88                                                           88    88                                 
// 	,adPPYba, MM88MMM ,adPPYYba,  ,adPPYba, 88   ,d8      ,adPPYba,  8b       d8  ,adPPYba, 8b,dPPYba, MM88MMM 88  ,adPPYba,  8b      db      d8  
// 	I8[    ""   88    ""     `Y8 a8"     "" 88 ,a8"      a8"     "8a `8b     d8' a8P_____88 88P'   "Y8   88    88 a8"     "8a `8b    d88b    d8'  
// 	 `"Y8ba,    88    ,adPPPPP88 8b         8888[        8b       d8  `8b   d8'  8PP""""""" 88           88    88 8b       d8  `8b  d8'`8b  d8'   
// 	aa    ]8I   88,   88,    ,88 "8a,   ,aa 88`"Yba,     "8a,   ,a8"   `8b,d8'   "8b,   ,aa 88           88    88 "8a,   ,a8"   `8bd8'  `8bd8'    
// 	`"YbbdP"'   "Y888 `"8bbdP"Y8  `"Ybbd8"' 88   `Y8a     `"YbbdP"'      "8"      `"Ybbd8"' 88           88    88  `"YbbdP"'      YP      YP      
// 	                                                                                                                                              
// 	                                                                                                                                              

_SO_getList = function(){

	request({
	    url: SO_frontpage,
	    json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {

	    	articleList.SO = [];

	        var $ = cheerio.load(body);

	        $('#mainArea').find('#question-list div h2').each(function(){
	        	var $that = $(this).find('a');
	        	
	        	articleList.SO.push({
	        		id: $that.parents('.question-container').data('sid').split('.')[0],
	        		title: $that.text().trim(),
	        		url: $that.attr('href')
	        	})
	        });
	    }
	});

},

SO_getList = function(){
	articleList.SO = SO_results.results;
};



module.exports = (function() {
	return {
		newList: _newList,
		HN_getList: _HN_getList,
		DN_getList: _DN_getList,
		SO_getList: _SO_getList,
		articleList: articleList
	};
})();
