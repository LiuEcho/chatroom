var express = require('express'),//引入express模块
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
	users=[];//保存所有在线用户的昵称

app.use('/', express.static(__dirname + '/www'))//指定静态HTML文件的位置
server.listen(process.env.PORT || 3000)
console.log("server started on port " + process.env.PORT || 3000)

io.sockets.on('connection', function(socket) {
	socket.on('login', function(nickname) {
		if (users.indexOf(nickname) > -1) {
			socket.emit('nickExisted');
		} else {
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login');
		}
	})
    //断开连接的事件
    socket.on('disconnect', function(){
    	//将断开连接的用户从users中删除
    	users.splice(socket.userIndex, 1);
    	//通知除自己以外的所有人
    	socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    })

    socket.on('postMsg', function(msg){
    	//将消息发送到除自己外的所有用户
    	socket.broadcast.emit('newMsg', socket.nickname, msg);
    })
});

