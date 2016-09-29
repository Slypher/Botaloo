'use strict';
const fs = require('fs');

const tools = require('../app/tools.js');
const config = require('../config.json');

exports['commands'] = [
    'version',
    'restart',
    'pm',
    'say',
    'eval',
    'exec'
]

exports['events'] = []

exports['flags'] = []

exports['version'] = {
    description: 'return the git commit this bot is running',
    process: function (bot, msg, arg) {
        var commit = require('child_process').spawn('git', ['log', '-n', '1']);

        commit.stdout.on('data', function (data) {
            msg.channel.sendMessage(data);
        });

        commit.on('close', function (code) {
            if (code != 0) msg.channel.sendMessage('Failed checking git version :cry:');
        });
    }
}

exports['restart'] = {
    user: '178482006320087042',
    description: 'bot will perform a git pull and restart',
    process: function (bot, msg, suffix) {
        msg.channel.sendMessage('fetching updates...').then(function (sentMsg) {
            console.log('updating...');
            var spawn = require('child_process').spawn;
            var log = function (err, stdout, stderr) {
                if (stdout) { console.log(stdout); }
                if (stderr) { console.log(stderr); }
            };
            var fetch = spawn('git', ['fetch']);
            fetch.stdout.on('data', function (data) {
                console.log(data.toString());
            });
            fetch.on('close', function (code) {
                var reset = spawn('git', ['reset', '--hard', 'origin/master']);
                reset.stdout.on('data', function (data) {
                    console.log(data.toString());
                });
                reset.on('close', function (code) {
                    var npm = spawn('npm', ['install']);
                    npm.stdout.on('data', function (data) {
                        console.log(data.toString());
                    });
                    npm.on('close', function (code) {
                        console.log('goodbye');
                        sentMsg.edit('brb!').then(function () {
                            bot.destroy().then(function () {
                                process.exit();
                            });
                        });
                    });
                });
            });
        });
    }
}

exports['pm'] = {
    usage: '<username> <message>',
    description: 'private message a user',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var whitespace = arg.indexOf(' ');
        var target = arg.substring(0, whitespace);
        var pm = arg.substring(whitespace + 1);

        if (pm == '') pm = 'Hello!';
        if (target == '') return msg.channel.sendMessage('Supply a username.');

        var user = tools.findUserByName(msg, target)[0];

        if (!user) return msg.channel.sendMessage('No user ' + target + ' found!');
        user.sendMessage(pm);
    }
}

exports['say'] = {
    usage: '<message>',
    description: 'bot will repeat after you',
    process: function (bot, msg, arg) {
        msg.channel.sendMessage(arg);
    }
}

exports['eval'] = {
    role: '191447208959279106',
    description: 'evaluate arbitrary javascript',
    usage: '<command>',
    process: function (bot, msg, arg) {
        try {
            msg.channel.sendMessage('```' + eval(arg) + '```');
        } catch (e) {
            msg.channel.sendMessage('```' + e + '```');
        }
    }
}

exports['exec'] = {
    user: '178482006320087042',
    description: 'execute arbitrary javascript',
    process: function (bot, msg, arg) {
        eval(arg);
    }
}