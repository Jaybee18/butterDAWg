import { Item } from "./PaletteItem";
//import { Playlist } from "./PlaylistWindow";
import { Playlist } from "./core/Playlist";
import { globals } from "./globals";
import { readdirSync } from "fs";
import { loadPalette } from "./util/Palette";
import { Mixer } from "./core/Mixer";

// load the core penis
globals.mixer = new Mixer();
globals.mixer.newChannel();
globals.mixer.newChannel();
globals.mixer.newChannel();
globals.mixer.newChannel();
globals.playlist = new Playlist();
for (let i = 0; i < 15; i++) {
	globals.playlist.newTrack().title = "Track " + i;
}

loadPalette();

// load all plugins, then do all the app shit
//import { CustomPlugin } from "./CustomPlugin";
/*const loadPluginsThen = (callback: Function) => {
	let plugin_promises = readdirSync("plugins").map((v: any) => {
		const pluginpath = "plugins/" + v;
		console.log(pluginpath);
		//globals.plugins.push(new CustomPlugin("./plugins/TestPlugin/plugin.js"));

		// dynamically load plugin classes from plugin folder
		let plugin_import = require("../" + pluginpath + "/main");
		//globals.plugins.push(new plugin_import.Plugin("./plugins/TestPlugin/plugin.js"));
		globals.plugins.push(new plugin_import.Plugin("./" + pluginpath));

		return globals.audiocontext.audioWorklet.addModule("./" + pluginpath + "/plugin.js");
	});
	Promise.allSettled(plugin_promises).then(callback());
};*/

//let playlist = new Playlist();
import { MixerWindow } from "./ui/windows/MixerWindow";
import { ColorPicker } from "./ui/windows/ColorPicker";
import { Color } from "./ui/misc/Color";
import { Plugin } from "./core/Plugin";
import { PluginWindow } from "./ui/windows/PluginWindow";
import { discoverPlugins } from "./util/plugins";
import { PlaylistWindow } from "./ui/windows/PlaylistWindow";
window.addEventListener("load", () => {
	// sidebar resizing
	var resizing_sidebar = false;

	(function() {
	var container = document.getElementById("content"),
		left = document.getElementById("sidebar"),
		right = document.getElementById("main_content"),
		handle = document.getElementById("sidebar_resize");

	handle.onmousedown = function(e) {
		resizing_sidebar = true;
		return false;
	};

	document.onmousemove = function(e) {
		// we don't want to do anything if we aren't resizing.
		if (!resizing_sidebar) {
		return;
		}

		var offsetRight = container.clientWidth - (e.clientX - container.offsetLeft);

		left.style.width = container.clientWidth - offsetRight + "px";
		right.style.width = offsetRight + "px";

		for (let i = 0; i < globals.windows.length; i++) {
			if (globals.windows[i].getPosition().x < left.clientWidth) {
				globals.windows[i].setPosition(left.clientWidth, globals.windows[i].getPosition().y);
			}
		}

		return false;
	}

	document.addEventListener("mouseup", () => {
		resizing_sidebar = false;
	});
	})();
});

require("./util/Header");

// discover all plugins
const availablePlugins = discoverPlugins();
globals.plugins = availablePlugins;

// load all plugins
const fs = require("fs");
globals.plugins.forEach(pluginPath => {
	const jsPath = pluginPath + "/plugin.js";
	const jsContent = fs.readFileSync(jsPath, "utf-8");
	
	// load audio worklet processor
	const blob = new Blob([jsContent], {type: "application/javascript; charset=utf-8"});
	const workletUrl = window.URL.createObjectURL(blob);
	globals.audiocontext.audioWorklet.addModule(workletUrl);
});

// tmp
const tmpPlaylist = new PlaylistWindow();
tmpPlaylist.setPosition(200, 440);
tmpPlaylist.update();

const tmpMixer = new MixerWindow();

globals.playlist.getTracks()[0].connect(globals.mixer.getChannels()[0]);