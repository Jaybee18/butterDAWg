"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("./globals");
var fs_1 = require("fs");
var loadPluginsThen = function (callback) {
    var plugin_promises = (0, fs_1.readdirSync)("plugins").map(function (v) {
        var pluginpath = "plugins/" + v;
        console.log(pluginpath);
        //globals.plugins.push(new CustomPlugin("./plugins/TestPlugin/plugin.js"));
        // dynamically load plugin classes from plugin folder
        var plugin_import = require("../" + pluginpath + "/main");
        globals_1.globals.plugins.push(new plugin_import.Plugin("./plugins/TestPlugin/plugin.js"));
        return globals_1.globals.audiocontext.audioWorklet.addModule("./plugins/TestPlugin/plugin.js");
    });
    Promise.allSettled(plugin_promises).then(callback());
};
//let playlist = new Playlist();
var MixerWindow_1 = require("./MixerWindow");
window.addEventListener("load", function () {
    //playlist.maximize();
    //playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
    //playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
    //playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
    // VERY TEMPORARY WORKAROUND!!
    //setTimeout(() => {
    //	playlist.tracks[0].audio_node.connect(plugin.getAudioNode());
    //	plugin.connect(globals.audiocontext.destination);
    //}, 300);
    loadPluginsThen(function () {
        var mixer = new MixerWindow_1.MixerWindow();
    });
});
// add all plugin slots
//for (let i = 0; i < 10; i++) {
//    pluginslots.push(new PluginSlot(i));
//}
//console.log(plugin);
// probably unnecessary
var Keybinds_1 = require("./Keybinds");
(0, Keybinds_1.setupKeybinds)();
require("./Header");
