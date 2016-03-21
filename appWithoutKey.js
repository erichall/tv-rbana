var SL = require('sl-api');

var http = require('http'),
	fs = require('fs');

	index = fs.readFileSync(__dirname + '/index.html'); //read html content

/*Send the html page to the client*/
var app = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-type' : 'text/html'});
	res.end(index);
	console.log("hje");
});

var io = require('socket.io').listen(app);

function sendTime() {
	io.emit('time', { time: new Date().toJSON() });
};

/*
setInterval(function(){
	var date = new Date();
	var sec = date.getSeconds();
	console.log(damSL());
	io.emit('time', damSL());
}, 1000);
*/

io.on('connection', function(socket) {
	socket.emit('welcome' , { message: 'Welcome!', id : socket.id });

	socket.on('trdy', function(data){
		var date = new Date();
		var m = date.getMinutes();
		var s = date.getSeconds();
		m = checkTime(m);
		s = checkTime(s);
		var time = date.getHours() + ":"+ m+ ":" +s;
		socket.emit('time', time);
	});

	function checkTime(i){
		if(i < 10){
			i = "0" + i;
		}
		return i;
	}

	socket.on('rdy', function(data){

		var sl = new SL({
			realtimeInformation:  '###KEY',
			locationLookup:  '##KEY'
		}, 'json'); 

		sl.realtimeInformation({siteid: 1550}, function callback(err, data){
		var obj = JSON.parse(data);
		var len = obj.ResponseData.Trams.length;
	
		for(var i = 0; i < len; i++){
			if(obj.ResponseData.Trams[i].StopPointNumber != 4532){
				socket.emit("OK", JSON.stringify(obj.ResponseData.Trams[i].DisplayTime));
				break;
			}
		}
		});

	});
});



app.listen(3000);




function damSL() {

	var result = "";

	var sl = new SL({
		realtimeInformation:  '#KEY',
		locationLookup:  '#KEY'
	}, 'json'); 

	sl.realtimeInformation({siteid: 1550}, function callback(err, data){
		var obj = JSON.parse(data);
		var len = obj.ResponseData.Trams.length;

		for(var i = 0; i < len; i++){
			if(obj.ResponseData.Trams[i].StopPointNumber != 4532){
				return JSON.stringify(obj.ResponseData.Trams[i].StopAreaName);
			}
		}
	});
}
