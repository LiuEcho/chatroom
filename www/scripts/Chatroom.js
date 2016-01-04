window.onload = function(){
	 //实例并初始化我们的hichat程序
	 var chatroom = new Chatroom();
	 chatroom.init();
	};

//定义Chatroom类
var Chatroom = function(){
	this.socket = null;
};

//原型添加方法
Chatroom.prototype = {
	init: function(){//此方法初始化程序
		var that = this;
		//建立到服务器的socket连接
		this.socket = io.connect();
		//监听socket的connect事件，此事件表示连接已经建立
		this.socket.on('connect', function(){
			//连接服务器后，显示昵称输入框
			document.getElementById('info').textContent = 'get yourself a nickname :)';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
			document.getElementById('loginBtn').addEventListener('click', function(){
				var nickname = document.getElementById('nicknameInput').value;
				//检查昵称输入框是否为空
				if (nickname.trim().length != 0) {
					that.socket.emit('login', nickname);
				}else{
					//否则输入框获得焦点
					document.getElementById('nicknameInput').focus();
				};
			}, false);

			document.getElementById('sendBtn').addEventListener('click', function(){
				var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value;
				messageInput.value='';
				messageInput.focus();
				if(msg.trim().length != 0){
					that.socket.emit('postMsg', msg);
					that._displayNewMsg('me', msg);
				}
			})

			document.getElementById('sendImage').addEventListener('change', function(){
				// 检查是否有文件被选中
				if (this.files.length != 0) {
					//获取文件并用FileReader进行读取 
					var file = this.files[0],
					reader = new FileReader();
					if (!reader) {
						that._displayNewMsg('system', '你的浏览器不支持FileReader', 'red')
						this.value = '';
						return;
					}
					reader.onload = function(e){
						//设置成功，显示页面并发送到服务器
						this.value = '';
						that.socket.emit('img', e.target.result);
						that._displayImage('me', e.target.result);
					};
					reader.readAsDataURL(file);
				}
			},false)
		});

		this.socket.on('nickExisted', function() {
     		document.getElementById('info').textContent = 'nickName is taken, choose another pls'; //显示昵称被占用的提示
     	});

		this.socket.on('loginSuccess', function(){
			document.title = 'Chatroom | ' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none';
			document.getElementById('messageInput').focus();
		})

		this.socket.on('system', function(nickName, userCount, type){
			// 判断用户是连接还是离开以显示不同的信息
			var msg = nickName + (type == 'login' ? ' joined' : ' left');
			//指定系统消息显示为红色
			that._displayNewMsg('system', msg ,'red')
			//将在线人数显示到页面顶部
			document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		})

		this.socket.on('newMsg', function(user, msg){
			that._displayNewMsg(user, msg);
		})

		this.socket.on('newImg', function(user, img){
			this._displayImage(user, img);
		})
	},

	_displayNewMsg: function(user, msg, color){
		var container = document.getElementById('historyMsg'),
		msgToDisplay = document.createElement('p'),
		date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class = "timespan">(' + date +'): </span>' +msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},

	_displayImage: function(user, imgData, color) {
		var container = document.getElementById('historyMsg'),
		msgToDisplay = document.createElement('p'),
		date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	}
}
