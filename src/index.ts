import { Item } from "./PaletteItem";
//import { Playlist } from "./PlaylistWindow";
import { Playlist } from "./core/Playlist";
import { globals } from "./globals";
import { readdirSync } from "fs";
import { loadPalette } from "./Palette";
import { Mixer } from "./core/Mixer";

// load the core penis
globals.mixer = new Mixer();
globals.mixer.newChannel();
globals.mixer.newChannel();
globals.mixer.newChannel();
globals.mixer.newChannel();
globals.playlist = new Playlist();
for (let i = 0; i < 15; i++) {
	globals.playlist.newTrack().setTitle("Track " + i);
}

loadPalette();

// load all plugins, then do all the app shit
//import { CustomPlugin } from "./CustomPlugin";
const loadPluginsThen = (callback: Function) => {
	let plugin_promises = readdirSync("plugins").map((v: any) => {
		const pluginpath = "plugins/" + v;
		console.log(pluginpath);
		//globals.plugins.push(new CustomPlugin("./plugins/TestPlugin/plugin.js"));

		// dynamically load plugin classes from plugin folder
		let plugin_import = require("../" + pluginpath + "/main");
		globals.plugins.push(new plugin_import.Plugin("./plugins/TestPlugin/plugin.js"));

		return globals.audiocontext.audioWorklet.addModule("./plugins/TestPlugin/plugin.js");
	});
	Promise.allSettled(plugin_promises).then(callback());
};

//let playlist = new Playlist();
import { MixerWindow } from "./ui/windows/MixerWindow";
window.addEventListener("load", () => {
	//playlist.maximize();
	//playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
	//playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
	//playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
	// VERY TEMPORARY WORKAROUND!!
	//setTimeout(() => {
	//	playlist.tracks[0].audio_node.connect(plugin.getAudioNode());
	//	plugin.connect(globals.audiocontext.destination);
	//}, 300);

	loadPluginsThen(() => {
		let mixer = new MixerWindow();
		//mixer.updateChannels();
		
	});
});

// add all plugin slots
//for (let i = 0; i < 10; i++) {
//    pluginslots.push(new PluginSlot(i));
//}
//console.log(plugin);

// probably unnecessary
//import { setupKeybinds } from "./Keybinds";
//setupKeybinds();

require("./Header");