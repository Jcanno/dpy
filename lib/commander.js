const commander = require('commander');
const packageJson = require('../package.json');
const chalk = require('chalk');

const program = new commander.Command(packageJson.name)
	.version(packageJson.version)
	.usage(`${chalk.green('[options]')}`)
	.option('-e, --env <target>', 'target deploy environment name')
	.parse(process.argv);

module.exports = program;
