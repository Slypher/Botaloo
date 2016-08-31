"use strict";
const fs = require('fs');

const main = require('./bot.js');
const tools = require('./tools.js');
const config = require('./config.json');

var events = {
    'message': {},
    'ready': {},
    'disconnected': {},
    'warn': {},
    'error': {},
    'debug': {}
}

var flags = {
    'd': {
        bool: false,
        description: 'deletes your command message',
        process: function (bot, msg, arg) {
            msg.delete();
        }
    }
};

var commands = {
    'help': {
        description: 'lists all commands',
        process: function (bot, msg, arg) {
            var response = 'Commands:```';
            for (var c in commands) {
                var desc = commands[c].description;
                var usage = commands[c].usage + ' ';

                if (usage === 'undefined ') usage = '';
                response += '\n' + c + ' ' + usage + '- ' + desc;
            }

            response += '```\n Flags:```';
            for (var flag in flags) {
                var desc = flags[flag].description;

                response += '\n-' + flag + ' - ' + desc;
            }
            response += '```';
            bot.sendMessage(msg.channel, response);
        }
    }
};

module.exports = {
    addCommand: function (name, object) {
        commands[name] = object;
    },

    addEvent: function (event, process) {
        events[event][Object.keys(events[event]).length] = process;
    },

    addFlag: function (name, object) {
        flags[name] = object;
    },

    message: function (message) {
        var bot = main.getBot();
        for (var i = 0; i < Object.keys(events['message']).length; i++) events['message'][i](bot, message);

        var msgPrefix = message.content.substring(0, config.prefix.length).replace(/\s/g, '').toLowerCase();
        if (msgPrefix === config.prefix.replace(/\s/g, '').toLowerCase()) {
            for (flag in flags) flags[flag].bool = false;
            var cmd = message.content.substring(config.prefix.length);
            console.log(tools.getTimestamp() + ' ' + cmd + ' from @' + message.author.username);

            if (cmd === '') bot.sendMessage(message.channel, 'That\'s me!');

            // check flags
            for (var flag in flags) {
                var flagpos = cmd.indexOf('-' + flag);
                if (flagpos != -1) {
                    flags[flag].bool = true;
                    cmd = cmd.substring(0, flagpos - 1) + cmd.substring(flagpos + 2, cmd.length);
                }
            }

            // check commands
            for (var c in commands) {
                var whitespace = cmd.indexOf(' ');
                if (whitespace === -1) whitespace = cmd.length;

                if (cmd.substring(0, whitespace).toLowerCase() === c) commands[c].process(bot, message, cmd.substring(c.length + 1, cmd.length));
            }

            // check flags
            for (flag in flags) if (flags[flag].bool) flags[flag].process(main.getBot(), message, cmd);
        }
    },

    ready: function () {
        var bot = main.getBot();
        for (var i = 0; i < Object.keys(events['ready']).length; i++) events['ready'][i](bot);

        console.log(tools.getTimestamp() + ' Ready to begin');
        for (var i = 0; i < bot.servers.length; i++) {
            var server = bot.servers[i];
            console.log(server.name + ' (' + server.id + ') - ' + server.channels.length + ' channels');
            if (!fs.existsSync(config.serverDir + server.id)) fs.mkdirSync(config.serverDir + server.id);
        }
        bot.setPlayingGame(config.game);
    },

    disconnected: function (m) {
        var bot = main.getBot();
        for (var i = 0; i < Object.keys(events['disconnected']).length; i++) events['disconnected'][i](bot, m);
        console.log(tools.getTimestamp() + ' [Disconnected] ' + m);
    },

    warn: function (m) {
        var bot = main.getBot();
        for (var i = 0; i < Object.keys(events['warn']).length; i++) events['warn'][i](bot, m);
        console.log(tools.getTimestamp() + ' [Warning] ' + m);
    },

    error: function (m) {
        var bot = main.getBot();
        for (var i = 0; i < Object.keys(events['error']).length; i++) events['error'][i](bot, m);
        console.log(tools.getTimestamp() + ' [Error] ' + m);
    },

    debug: function (m) {
        var bot = main.getBot();
        for (var i = 0; i < Object.keys(events['debug']).length; i++) events['debug'][i](bot, message);
        console.log(tools.getTimestamp() + ' [Debug] ' + m);
    }
}