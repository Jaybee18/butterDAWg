"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlaylistWindow_1 = require("./PlaylistWindow");
var globals_1 = require("./globals");
var temp_plugin_test_1 = require("./temp_plugin_test");
var plugin = (0, temp_plugin_test_1.loadPlugin)();
var playlist = new PlaylistWindow_1.Playlist();
window.addEventListener("load", function () {
    //playlist.maximize();
    //playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
    //playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
    //playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
    // VERY TEMPORARY WORKAROUND!!
    setTimeout(function () {
        playlist.tracks[0].audio_node.connect(plugin.getAudioNode());
        plugin.connect(globals_1.globals.audiocontext.destination);
    }, 300);
});
var MixerWindow_1 = require("./MixerWindow");
var mixer = new MixerWindow_1.MixerWindow();
require("./Mixer");
// probably unnecessary
var Keybinds_1 = require("./Keybinds");
(0, Keybinds_1.setupKeybinds)();
