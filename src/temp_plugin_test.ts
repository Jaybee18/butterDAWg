import { readFileSync } from "original-fs";
import { CustomPlugin } from "./CustomPlugin";
import { globals } from "./globals";
import { Window } from "./window";

class PluginWindow extends Window {

    private pluginpath: string;
    private plugin: CustomPlugin;

    constructor(pluginpath: string) {
        super(false);

        this.pluginpath = pluginpath;

        this.initialiseContent();
    }

    initialiseContent(): void {
        let content = readFileSync(this.pluginpath + "/index.html", {encoding: "ascii"});

        this.setContent(content);

        let plugin = require("../" + this.pluginpath + "/main");
        this.plugin = new plugin.Plugin();

        this.setContentSize(450, 420);
    }

    getPlugin(): CustomPlugin {
        return this.plugin;
    }
}

export function loadPlugin() {
    const pluginpath = "plugins/TestPlugin";

    let win = new PluginWindow(pluginpath);
    return win.getPlugin();
}