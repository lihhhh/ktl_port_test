var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');


function getHttp(option, callback) {
    http.get(option, function(res) {
        var chunks = [];
        res.on('data', function(chunk) {
            chunks.push(chunk);
        })
        res.on('end', function() {
            var html = Buffer.concat(chunks).toString();
            callback(html);
        })
    }).on('error', (e) => {
        console.error(e);
    });
}


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/port_test.html');
})

app.get('/getData', function(req, res) {
    var option = {
        hostname: '192.168.10.133',
        port: '8080',
        path: '/ktl/help.jsp'
    };
    getHttp(option, function(html) {
        var $ = cheerio.load(html);

        var result = [];
        $('table').get().map(function(item) {
            var temp = {
                title: '',
                data: []
            };
            temp.title = $(item).prev().text();
            $(item).find('tr').get().map(function(tr) {
                temp.data.push({
                    name: $(tr).find('td').eq(1).text(), //名称
                    url: $(tr).find('td a').eq(0).text(), //url后缀
                    pointer_url: $(tr).find('td a').eq(0).attr('href') //目标详细页面 url地址
                })
            })
            result.push(temp);
        })
        console.log(result);
        res.status(200).json({ success: true, result: result });
    })
})

app.get('/getDetail', function(req, res) {
    var query = req.query;
    var option = {
        hostname: '192.168.10.133',
        port: '8080',
        path: '/ktl/' + query.pointer_url
    };

    getHttp(option, function(html) {
        var $ = cheerio.load(html);
        var result = [];
        $('table').eq(0).find('tr').get().map(function(tr, index) {

            if (index > 0) {
                var temp = {
                    argname:$(tr).find('td').eq(0).text(),
                    field:$(tr).find('td').eq(1).text(),
                    ms:$(tr).find('td').eq(2).text(),
                };
                result.push(temp);
            }

        })
        console.log(result);
        res.status(200).json({ success: true, result: result });
    })
})

app.get('/getDetailData', function(req, res) {
    var query = req.query;
    console.log(query);
    var option = {
        hostname: '192.168.10.133',
        port: '8080',
        path: '/ktl/' + query.pointer_url + '?'
    };
    var url = [];
    for (var key in query) {
        if (key != 'pointer_url') {
            url.push(key + '=' + query[key]);
        }
    }
    option.path += url.join('&');

    getHttp(option, function(_d) {
        res.status(200).json({ success: true, result: _d });
    })
})

app.listen(8888, function() {
    console.log('run server 8888');
})