"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PaletteItem_1 = require("./PaletteItem");
var PlaylistWindow_1 = require("./PlaylistWindow");
var playlist = new PlaylistWindow_1.Playlist();
window.addEventListener("load", function () {
    playlist.maximize();
    playlist.addSample(new PaletteItem_1.Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
    playlist.addSample(new PaletteItem_1.Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
    playlist.addSample(new PaletteItem_1.Item("kick1.wav", "./files/0Current project/kick1.wav"));
});
var Keybinds_1 = require("./Keybinds");
(0, Keybinds_1.setupKeybinds)();
