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

		this.socket.on('newMsg', function(user, msg, color){
			that._displayNewMsg(user, msg, color);
		})

		this.socket.on('newImg', function(user, img, color){
			that._displayImage(user, img, color);
		})

		document.getElementById('loginBtn').addEventListener('click', function(){
			var nickname = document.getElementById('nicknameInput').value;
				//检查昵称输入框是否为空
				if (nickname.trim().length != 0) {
					that.socket.emit('login', nickname);
				}else{
					//否则输入框获得焦点
					document.getElementById('nicknameInput').focus();
				};
			},false);

		document.getElementById('sendBtn').addEventListener('click', function(){
			var messageInput = document.getElementById('messageInput'),
			msg = messageInput.value,
			//获取颜色值
			color = document.getElementById('colorStyle').value;
			messageInput.value='';
			messageInput.focus();
			if(msg.trim().length != 0){
				that.socket.emit('postMsg', msg, color);
				that._displayNewMsg('me', msg, color);
			}
		},false)

		document.getElementById('sendImage').addEventListener('change', function(){
				// 检查是否有文件被选中
				if (this.files.length != 0) {
					//获取文件并用FileReader进行读取 
					var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
					if (!reader) {
						that._displayNewMsg('system', '你的浏览器不支持FileReader', 'red')
						this.value = '';
						return;
					}
					reader.onload = function(e){
						//设置成功，显示页面并发送到服务器
						this.value = '';
						that.socket.emit('img', e.target.result, color);
						that._displayImage('me', e.target.result, color);
					};
					reader.readAsDataURL(file);
				}
			},false)

		document.getElementById('clearBtn').addEventListener('click', function(){
			var container = document.getElementById('historyMsg');
			container.innerHTML = "";
		},false)

		this._initialEmoji();

		document.getElementById('emoji').addEventListener('click', function(e) {
			var emojiwrapper = document.getElementById('emojiWrapper');
			emojiwrapper.style.display = 'block';
			e.stopPropagation();
		}, false);

		document.body.addEventListener('click', function(e) {
			var emojiwrapper = document.getElementById('emojiWrapper');
			if (e.target != emojiwrapper) {
				emojiwrapper.style.display = 'none';
			};
		});

		document.getElementById('emojiWrapper').addEventListener('click', function(e) {
    	//获取被点击的表情
    	var target = e.target;
    	if (target.nodeName.toLowerCase() == 'img') {
    		var messageInput = document.getElementById('messageInput');
    		messageInput.focus();
    		messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
    	};
    }, false);
	},

	_showEmoji: function(msg) {
		var match, result = msg,
		reg = /\[emoji:\d+\]/g,
		emojiIndex,
		totalEmojiNum = document.getElementById('emojiWrapper').children.length;
		while (match = reg.exec(msg)) {
			emojiIndex = match[0].slice(7, -1);
			if (emojiIndex > totalEmojiNum) {
				result = result.replace(match[0], '[X]');
			} else {
				result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
			};
		};
		return result;
	},

	_initialEmoji: function() {
		var emojiContainer = document.getElementById('emojiWrapper'),
		docFragment = document.createDocumentFragment();
		for (var i = 69; i > 0; i--) {
			var emojiItem = document.createElement('img');
			emojiItem.src = '../content/emoji/' + i + '.gif';
			emojiItem.title = i;
			docFragment.appendChild(emojiItem);
		};
		emojiContainer.appendChild(docFragment);
	},

	_displayNewMsg: function(user, msg, color){
		var container = document.getElementById('historyMsg'),
		msgToDisplay = document.createElement('p'),
		date = new Date().toTimeString().substr(0, 8),
		msg = this._showEmoji(msg);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class = "timespan"> (' + date +'): </span>' +msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},

	_displayImage: function(user, imgData, color) {
		var container = document.getElementById('historyMsg'),
		msgToDisplay = document.createElement('p'),
		date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan"> (' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	}
}
