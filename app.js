var express = require('express');
var app = express();
var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');


function getHttp(option,callback){
	http.get(option, function(res) {
	    var chunks = [];
	    res.on('data', function(chunk) {
	        chunks.push(chunk);
	    })
	    res.on('end', function() {
	    	var html = Buffer.concat(chunks).toString();
	    	callback(html);
	    })
	    res.on('error',function(err){
	    	console.log(err);
	    })
	})
}


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/port_test.html');
})

app.get('/getData',function(req,res){
	var option = {
	    hostname: '192.168.10.133',
	    port: '8080',
	    path: '/ktl/help.jsp'
	};
	getHttp(option,function(html){
		//html = iconv.decode(new Buffer(html),'utf-8');
		var $ = cheerio.load(html);

		console.log($);
		var result = [];
		$('table').get().map(function(item){
			var temp = {
				title:'',
				data:[]
			};
			temp.title = $(item).prev().text();
			$(item).find('tr').get().map(function(tr){
				temp.data.push({
					name : $(tr).find('td').eq(1).text(),  //名称
					url : $(tr).find('td a').eq(0).text(),		//url后缀
					pointer_url : $(tr).find('td a').eq(0).attr('href') //目标详细页面 url地址
				})
			})
			result.push(temp);
		})
		console.log(result);
	})
})

app.get('/getpointer_url',function(req,res){
	var query = req.query;
	var option = {
	    hostname: '192.168.10.133',
	    port: '8080',
	    path: '/ktl/'+query.pointer_url
	};
	getHttp(option,function(html){
		var $ = cheerio.load(html);
	})
})

app.listen(8888, function() {
    console.log('run server 8888');
})