import { Item } from "./PaletteItem";
import { Playlist } from "./PlaylistWindow";

let playlist = new Playlist();
window.addEventListener("load", () => {
	playlist.maximize();
	playlist.addSample(new Item("rawstyle_kick.wav", "./files/0Current project/rawstyle_kick.wav"));
	playlist.addSample(new Item("drum loop 3.wav", "./files/0Current project/drum loop 3.wav"));
	playlist.addSample(new Item("kick1.wav", "./files/0Current project/kick1.wav"));
});

import { setupKeybinds } from "./Keybinds";
setupKeybinds();