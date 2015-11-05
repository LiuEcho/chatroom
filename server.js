var express = require('express')//引入express模块
	app = express()
	server = require('http').createServer(app)
app.use('/', express.static(__dirname + '/www'))//指定静态HTML文件的位置
server.listen(8080)
console.log("server started")