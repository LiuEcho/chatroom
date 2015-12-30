var express = require('express'),//引入express模块
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
app.use('/', express.static(__dirname + '/www'))//指定静态HTML文件的位置
server.listen(3000)
console.log("server started")

io.on('connection', function(socket) {
    //接收并处理客户端发送的foo事件
    socket.on('foo', function(data) {
        //将消息输出到控制台
        console.log(data);
    })
});