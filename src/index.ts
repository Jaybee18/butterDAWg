import { Item } from "./PaletteItem";
import { Playlist } from "./PlaylistWindow";
import { globals } from "./globals";

import { PluginWindow } from "./temp_plugin_test";
const pluginpath = "plugins/TestPlugin";
let win = new PluginWindow(pluginpath);
let plugin = win.getPlugin();
console.log("test", plugin);

let playlist = new Playlist();
window.addEventListener("load", () => {
	//playlist.maximize();
	//playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
	//playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
	//playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
	// VERY TEMPORARY WORKAROUND!!
	return;
	setTimeout(() => {
		playlist.tracks[0].audio_node.connect(plugin.getAudioNode());
		plugin.connect(globals.audiocontext.destination);
	}, 300);
});

import { MixerWindow } from "./MixerWindow";
import { pluginslots, PluginSlot } from "./Mixer";
let mixer = new MixerWindow();
require("./Mixer");
// add all plugin slots
for (let i = 0; i < 10; i++) {
    pluginslots.push(new PluginSlot(i));
}
import { Channel } from "./Channel";
// add all channels
for (let i = 0; i < 60; i++) {
	let a = new Channel(i);
	a.addToMixer();
	globals.channels.push(a);
}
console.log(plugin);
globals.channels[0].addPlugin(plugin);

// probably unnecessary
import { setupKeybinds } from "./Keybinds";
setupKeybinds();
