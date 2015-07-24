var List = require('./list.js'),
	Article = require('./article.js'),
	Question = require('./question.js'),
	http = require('http'),
	bodyParser = require('body-parser'),
	express = require('express'),
	cors = require('cors'),
	nodemailer = require('nodemailer'),
	app = express();

	app.use(cors());


var getLists = function(){
	List.HN_getList();
	List.DN_getList();
	List.SO_getList();
	console.log('NEW LIST CONSTRUCTED');
}

setInterval(getLists, 1200000);

getLists();


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'pfuuse@gmail.com',
        pass: 'pfuusguet'
    }
});

var server = app.listen(5000, 'localhost', function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Hello from http://%s:%s', host, port);
});

app.use(express.static('public'));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ 
  extended: true
}));

app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/api/list', function (req, res) {
	res.send(List.articleList);
	console.log('THE LIST')
});

app.post('/api/view', function (req, res) {
	// console.log(req.body)

	if (req.body.origin === 'so'){
		Question.parse(req.body.url, function(content){
			res.send(content);
		});
	}else{
		Article.parse(req.body.url, function(content){
			res.send(content);
		});
	}
	console.log('AN ARTICLE')
}); 

var mailOptions = {
    from: 'pfuuse@gmail.com',
    to: 'ghettosoak@gmail.com',
    subject: 'READR',
    text: 'Transcendent links!',
};

app.post('/api/send', function (req, res) {
	console.log('A MESSAGE')

	var saveData = req.body;
	var mailBody = '<h1>Hi there!</h1><p>Here\s the stuff you saved for later on ' + saveData.time + '.</p>'

	for (var i in saveData.list){
		mailBody += '<h3>' + i + '</h3>'
		for (var j = 0; j < saveData.list[i].length; j++){
			mailBody += '<p>' + 
				'<a href="' + saveData.list[i][j].url + '">' + saveData.list[i][j].title + '</a>' + 
			'</p>';
		}
	}

	mailBody += '<p>&nbsp;</p><p>Please note that I am only a robot – replies to this email will never be read by human eyes.</p><p>Enjoy!</p>';
	mailOptions.html = mailBody;

	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	    }else{
	        console.log('Message sent: ' + info.response);
			res.send('sending message!');
	    }
	});
	
});













