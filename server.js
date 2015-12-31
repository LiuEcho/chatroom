var express = require('express'),//引入express模块
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
	users=[];//保存所有在线用户的昵称

app.use('/', express.static(__dirname + '/www'))//指定静态HTML文件的位置
server.listen(3000)
console.log("server started")

io.on('connection', function(socket) {
    socket.on('login', function(nickname) {
        if (users.indexof(nickname) > -1) {
       		socket.emit('nickExisted');
        } else {
        	socket.userIndex = users.length;
        	socket.nickname = nickname;
        	users.push(nickname);
        	socket.emit('loginSuccess');
        	io.socket.emit('system', nickname);
        }
    })
});