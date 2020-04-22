# dpy
 light deploy base on node-ssh

# 安装

```js
npm i dpy --save-dev
```

# 用法

- 在当前项目根目录下配置`.dpyrc.js`或`dpy.config.js`文件
- ```js
  module.exports = {
	env: [{
		name: 'dev',						// 环境名称
		local: '/dist',						// 本地待发布文件路径
		remote: '/brm/vueBRM',					// 远程目标文件路径
		password: 'xxxxxx',					// 链接ssh密码
		host: '192.168.1.222',					// 远程地址
		port: 22,						// 远程地址目标端口
		username: 'root'					// 登录用户名
	}]
  }
	```
- 执行`dpy`则执行部署命令，选择目标环境发布
- 可加`-e [env.name]`直接选择目标环境跳过环境选择
