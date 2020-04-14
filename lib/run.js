const node_ssh = require('node-ssh');
const fs = require('fs');
const path = require('path');
const ssh = new node_ssh();
const sourceDir = path.resolve(process.cwd(), 'dist.zip');
const archiver = require('archiver');
let targetDir;
const chalk = require('chalk');

function run(config) {
	targetDir = config.remote.replace(path.basename(config.remote), '');
	compress(config);
}

module.exports = run;

function compress(config) {
	// 设置压缩类型及级别
	const archive = archiver('zip', {
		zlib: { level: 9 }
	}).on('error', err => {
		throw err;
	});

	// 创建文件输出流
	const output = fs.createWriteStream(sourceDir).on('close', err => {
		if (err) {
			console.log('  关闭archiver异常:', err);
			process.exit(0);
		}
		
		console.log('====================================');
		console.log(chalk.green('压缩文件成功'));
		console.log('====================================');
		connectAndUpload(config);
	});

	archive.pipe(output);
	archive.directory(config.local, path.basename(config.remote));

	// 完成打包归档
	archive.finalize();
}

function connectAndUpload(config) {
	ssh.connect({
		host: config.host,
		username: config.username,
		password: config.password
	}).then(() => {
		console.log();
		console.log(chalk.green(`成功连接到 ${chalk.blue(config.host)}`));
		console.log();
		console.log(chalk.bgBlueBright('正在上传'));
		console.log();
		
		ssh.putFile(sourceDir, `${targetDir}/dist.zip`).then(function() {
			console.log(chalk.green('上传文件成功'));
			const commands = getCommand();
			let promises = [];

			console.log();
			console.log(chalk.bgBlueBright('正在解压'));
			console.log();
			for(const command of commands) {
				promises.push(runCommand(command));
			}

			Promise.all(promises).then(() => {
				deleteLocalZip();
				console.log();
				console.log(chalk.bgGreen(`成功发布到${chalk.blue(config.name)}`));
				console.log();
				process.exit(0);
			}).catch(() => {
				console.log('文件解压失败');
			});
		}, function(err) {
			console.log("Something's wrong");
			console.log(err);
		});
	}).catch(() => {
		console.log('连接失败');
	});
}

function getCommand() {
	return [`cd ${targetDir}`, 'unzip -o dist.zip && rm -f dist.zip'];
}

// 执行Linux命令
function runCommand(command) {
	return new Promise((resolve, reject) => {
		ssh.execCommand(command, { cwd: targetDir })
			.then(() => {
				resolve();
				// if (result.stdout) {
				//   successLog(result.stdout);
				// }
				// if (result.stderr) {
				//   errorLog(result.stderr);
				//   process.exit(1);
				// }
			})
			.catch(err => {
				reject(err);
			});
	});
}

function deleteLocalZip() {
	fs.unlink(sourceDir, err => {
		if(err) {
			console.log('删除本地zip失败');
		}

		process.exit(0);
	});
}
