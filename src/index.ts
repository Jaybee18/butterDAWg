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
    globals.playlist.newTrack().setTitle("Track " + i);
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
window.addEventListener("load", () => {
    // sidebar resizing
    var resizing_sidebar = false;

    (function () {
        var container = document.getElementById("content"),
            left = document.getElementById("sidebar"),
            right = document.getElementById("main_content"),
            handle = document.getElementById("sidebar_resize");

        handle.onmousedown = function (e) {
            resizing_sidebar = true;
            return false;
        };

        document.onmousemove = function (e) {
            // we don't want to do anything if we aren't resizing.
            if (!resizing_sidebar) {
                return;
            }

            var offsetRight =
                container.clientWidth - (e.clientX - container.offsetLeft);

            left.style.width = container.clientWidth - offsetRight + "px";
            right.style.width = offsetRight + "px";

            for (let i = 0; i < globals.windows.length; i++) {
                if (globals.windows[i].getPosition().x < left.clientWidth) {
                    globals.windows[i].setPosition(
                        left.clientWidth,
                        globals.windows[i].getPosition().y,
                    );
                }
            }

            return false;
        };

        document.addEventListener("mouseup", () => {
            resizing_sidebar = false;
        });
    })();
});

// add all plugin slots
//for (let i = 0; i < 10; i++) {
//    pluginslots.push(new PluginSlot(i));
//}
//console.log(plugin);

// probably unnecessary
//import { setupKeybinds } from "./Keybinds";
//setupKeybinds();

require("./util/Header");

// plugin test
// console.log(window.location.pathname)
// let p = new Plugin("Distortion");
// // let plugin_module = require("../plugins/Distortion/main");
// let plugin_module = require("/Users/jbes/GitHub/butterDAWg/plugins/Distortion/main");
// let pluginWindow = new plugin_module.Plugin(p);

const pluginPath = "SimpleDistortion/";
const htmlPath = pluginPath + "plugin.html";
const jsPath = pluginPath + "plugin.js";
const hostPath = pluginPath + "host.js";

const fs = require("fs");
const htmlContent = fs.readFileSync(htmlPath, "utf-8");
const jsContent = fs.readFileSync(jsPath, "utf-8");
const hostContent = fs.readFileSync(hostPath, "utf-8");

const containerId = "lnnkneronernk";

// load audio worklet processor
const blob = new Blob([jsContent], {
    type: "application/javascript; charset=utf-8",
});
const workletUrl = window.URL.createObjectURL(blob);
globals.audiocontext.audioWorklet.addModule(workletUrl).then(() => {
	const audioNode = new AudioWorkletNode(globals.audiocontext, "SimpleDistortion");

	new PluginWindow(audioNode);
});
