"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlaylistWindow_1 = require("./PlaylistWindow");
var globals_1 = require("./globals");
var temp_plugin_test_1 = require("./temp_plugin_test");
var pluginpath = "plugins/TestPlugin";
var win = new temp_plugin_test_1.PluginWindow(pluginpath);
var plugin = win.getPlugin();
console.log("test", plugin);
var playlist = new PlaylistWindow_1.Playlist();
window.addEventListener("load", function () {
    //playlist.maximize();
    //playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
    //playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
    //playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
    // VERY TEMPORARY WORKAROUND!!
    return;
    setTimeout(function () {
        playlist.tracks[0].audio_node.connect(plugin.getAudioNode());
        plugin.connect(globals_1.globals.audiocontext.destination);
    }, 300);
});
var MixerWindow_1 = require("./MixerWindow");
var Mixer_1 = require("./Mixer");
var mixer = new MixerWindow_1.MixerWindow();
require("./Mixer");
// add all plugin slots
for (var i = 0; i < 10; i++) {
    Mixer_1.pluginslots.push(new Mixer_1.PluginSlot(i));
}
var Channel_1 = require("./Channel");
// add all channels
for (var i = 0; i < 60; i++) {
    var a = new Channel_1.Channel(i);
    a.addToMixer();
    globals_1.globals.channels.push(a);
}
console.log(plugin);
globals_1.globals.channels[0].addPlugin(plugin);
// probably unnecessary
var Keybinds_1 = require("./Keybinds");
(0, Keybinds_1.setupKeybinds)();
