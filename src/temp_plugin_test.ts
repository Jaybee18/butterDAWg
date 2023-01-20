import { readFileSync } from "original-fs";
import { CustomPlugin } from "./CustomPlugin";
import { globals } from "./globals";
import { Window } from "./window";

export class PluginWindow extends Window {

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

        let plugin_module = require("../" + this.pluginpath + "/main");
        console.log(plugin_module);
        this.plugin = new plugin_module.Plugin();
        console.log(this.plugin.getAudioNode());

        this.setContentSize(450, 420);
    }

    getPlugin(): CustomPlugin {
        return this.plugin;
    }
}
