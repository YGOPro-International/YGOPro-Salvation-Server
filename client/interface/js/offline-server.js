/* jslint node : true */
/* jslint browser : true */
/* global localStorage, require, confirm, alert */
//development, stage, production
var template =
    "use_d3d = {use_d3d}\r\n\
allow_resize =  {use_d3d}\r\n\
antialias = {antialias}\r\n\
errorlog = 1\r\n\
nickname = {nickname}\r\n\
roompass = {roompass}\r\n\
lastdeck = {lastdeck}\r\n\
textfont = fonts/{textfont} {textfontsize}\r\n\
serverport = {serverport}\r\n\
lastip = {lastip}\r\n\
lastport = {lastport}\r\n\
numfont = fonts/{numfont}\r\n\
fullscreen = {fullscreen}\r\n\
enable_sound = {enable_sound}\r\n\
sound_volume = {sound_volume}\r\n\
enable_music = {enable_music}\r\n\
music_volume = {music_volume}\r\n\
skin_index = {skin_index}\r\n\
auto_card_placing = {auto_card_placing}\r\n\
random_card_placing = {random_card_placing}\r\n\
auto_chain_order = {auto_chain_order}\r\n\
no_delay_for_chain = {no_delay_for_chain}\r\n\
enable_sleeve_loading = {enable_sleeve_loading}\r\n\
forced = 0\r\n\
save_last_replay = {save_last_replay}\r\n\
control_mode = 1\r\n\
hide_setname = {hide_setname}\r\n\
hide_chain_button = {hide_chain_button}\r\n\
";

var os = require('os');
var http = require('http');
var url = require('url');
var child_process = require('child_process');
var fs = require('fs');
var operating_system = os.platform();

var platform = {
    darwin: 'application_mac_ygopro',
    linux: './application_ygopro',
    win32: 'application_ygopro.exe',
    win64: 'application_ygopro.exe'
};

var executable = platform[operating_system] || 'ygopro';

if (operating_system === 'linux' || operating_system === 'darwin') {
    fs.chmod('./ygopro/' + executable, '0777', function (error) {
        if (error) console.log(error);
    }); // creates race condition requiring launcher restart.
}

if (operating_system === 'linux' && os.arch() === 'x64') {
    executable = './application_ygopro64'
}

var settings = ['use_d3d', 'antialias', 'errorlog', 'nickname', 'roompass', 'lastdeck', 'textfont', 'numfont', 'fullscreen', 'enable_sound',
'sound_volume', 'enable_music', 'music_volume', 'skin_index', 'auto_card_placing', 'random_card_placing', 'auto_chain_order', 'no_delay_for_chain',
'enable_sleeve_loading', 'serverport', 'lastip', 'textfontsize', 'lastport', 'forced', 'save_last_replay', 'control_mode', 'hide_setname', 'hide_chain_button'];

try {
    var localStorageExist = localStorage;
} catch (e) {
    /*jshint -W020 */
    localStorage = {};
}
try {
    //require('nw.gui').Window.get().showDevTools();
} catch (error) {
    console.log('Cant open development tools');
}
try {
    var normal = true;
    var template = fs.readFileSync('./interface/template.ini', 'utf-8');
} catch (e) {
    var normal = false;

}
for (var i = 0; settings.length > i; i++) {
    if (!localStorageExist || !localStorage[settings[i]]) {
        localStorage.use_d3d = '1';
        localStorage.antialias = '0';
        localStorage.errorlog = '0';
        localStorage.nickname = 'Player';
        localStorage.roompass = '';
        localStorage.lastdeck = '';
        localStorage.textfont = 'simhei.ttf';
        localStorage.textfontsize = '12';
        localStorage.numfont = 'arialbd.ttf';
        localStorage.serverport = '8911';
        localStorage.lastip = '127.0.0.1';
        localStorage.lastport = '8911';
        localStorage.fullscreen = '0';
        localStorage.enable_sound = '1';
        localStorage.sound_volume = '100';
        localStorage.enable_music = '0';
        localStorage.music_volume = '100';
        localStorage.skin_index = '-1';
        localStorage.auto_card_placing = '1';
        localStorage.random_card_placing = '0';
        localStorage.auto_chain_order = '0';
        localStorage.no_delay_for_chain = '0';
        localStorage.enable_sleeve_loading = '0'
		localStorage.forced = '0'
		localStorage.save_last_replay = '0'
		localStorage.control_mode = '1'
		localStorage.hide_setname = '0'
		localStorage.hide_chain_button = '0';
    }
}

function runYGOPro(mode, callback) {
    //console.log(template);
    var systemConf = template;

    function fillInData(form, placeholder, value) {
        var re = new RegExp(placeholder, 'g');
        form = form.replace(re, value);
        return form;
    }
    for (var i = 0; settings.length > i; i++) {
        systemConf = fillInData(systemConf, '{' + settings[i] + '}', localStorage[settings[i]]);
    }
    var path = './ygopro/system.conf';
    fs.writeFile(path, systemConf, function (err) {
        if (err) {
            console.log('file permission error, cant edit ' + path);

        }
        console.log(mode);
        //console.log('It\'s saved!');
        try {
            var instance = child_process.execFile(executable, [mode], {
                cwd: (process.cwd() + './ygopro')
            }, function (error) {
                if (error !== null) {
                    //write crash report;
                    console.log('YGOPro Crashed');
                    var filelocation = 'crash_report_YGOPro_' + (new Date().toDateString()) + '.log';
                    fs.writeFile(filelocation, error, function () {});
                }
                //            fs.readFile(__dirname + '/../../ygopro/system.conf', function (error, file) {
                //                if (error !== null) {
                //                    console.log('file permission error, cant read system.conf');
                //                    throw err;
                //                }
                //                console.log("file os =", file, typeof file);
                //                var options = file.split('\r\n');
                //                console.log(options);
                //            });
            });
            instance.stdout.on('data', function (core_message_raw) {
                console.log('ygopro:', core_message_raw);
            });
        } catch (error) {
            alert('Look at the top left-hand corner, LET THE UPDATE FINISH!');

        }

    });
}

function fileError(mainError) {
    var filename = 'errorReport' + (new Date().toDateString) + '.log';
    fs.writeFile(filename, mainError, function () {});
}
try {
    module.exports = runYGOPro;
} catch (e) {

}