import { Item } from "./PaletteItem";
import { Playlist } from "./PlaylistWindow";
import { globals } from "./globals";

import { loadPlugin } from "./temp_plugin_test";
let plugin = loadPlugin();

let playlist = new Playlist();
window.addEventListener("load", () => {
	playlist.maximize();
	//playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
	//playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
	//playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
	playlist.tracks[0].audio_node.connect(plugin.getAudioNode());
	plugin.connect(globals.audiocontext.destination);
});

// probably unnecessary
import { setupKeybinds } from "./Keybinds";
setupKeybinds();
