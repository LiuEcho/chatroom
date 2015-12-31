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
		});

		this.socket.on('nickExisted', function() {
     		document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
 		});

		this.socket.on('loginSuccess', function(){
			document.title = 'chatroom | ' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none';
			document.getElementById('messageInput').focus();
		})
	}
}
