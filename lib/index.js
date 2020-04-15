#!/usr/bin/env node

const program = require('./commander');
const run = require('./run');
const inquirer = require('inquirer');
const fs = require('fs');
const chalk = require('chalk');
const cwd = process.cwd();
const rcFile = `${cwd}/.dpyrc.js`;
const configFile = `${cwd}/dpy.config.js`;
const config = getConfig();
const env = config.env;
let selectEnv;

checkConfig(env);

const envName = env.reduce((names, e) => {
	names.push(e.name);
	return names;
}, []);

if(!program.env) {
	inquirer.prompt([
		{
			type: 'list',
			message: '请选择发布环境:',
			name: 'env',
			choices: envName
		}
	]).then(result => {
		selectEnv = result.env;
		const selectConfig = env.find(e => e.name === selectEnv);

		run(selectConfig);
	});
} else {
	if(!envName.includes(program.env)) {
		tipError(`${chalk.red(`❌ 配置中没有name为 ${chalk.blue(`${program.env}`)} 的环境`)}`);
	}else {
		const selectConfig = env.find(e => e.name === program.env);

		run(selectConfig);
	}
}

function checkConfig(env) {
	if(!env) {
		tipError(`${chalk.red(`❌ 配置中不存在 ${chalk.blue('env')} 字段!`)}`);
	}

	if(!Array.isArray(env)) {
		tipError(`${chalk.red('❌ env字段必须为数组!')}`);
	}

	for(const e of env) {
		if(!e.name) {
			tipError(`${chalk.red(`❌ 配置中缺少 ${chalk.blue('name')} 字段!`)}`);
		}
	}
}

function getConfig() {
	let config;

	if(!fs.existsSync(rcFile) && !fs.existsSync(configFile)) {
		tipError(`${chalk.red(`❌ 当前目录缺少 ${chalk.blue('.dpyrc.js')} 或 ${chalk.blue('dpy.config.js')} 配置文件!`)}`);
	}
	
	fs.existsSync(rcFile) ? (config = require(rcFile)) : (config = require(configFile));
	return config;
}

function tipError(message) {
	console.log();
	console.log(message);
	console.log();
	
	process.exit(0);
}
