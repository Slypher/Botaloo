'use strict';
const child_process = require('child_process');
const util = require('util');

console.log = function (d) {
    process.stdout.write(util.format(d));
};

start();
function start() {
    var proc = child_process.spawn('node', ['./app/bot.js']);

    proc.stdout.on('data', function (data) { console.log(data.toString()); });
    proc.stderr.on('data', function (data) { console.log(data.toString()); });

    proc.on('exit', function (code) {
        console.log('Restarting main process: ' + code + '\n');
        delete(this.proc);
        setTimeout(start, 5000);
    });
}