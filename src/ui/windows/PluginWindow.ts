import { readFileSync } from "original-fs";
import { CustomPlugin } from "../../CustomPlugin";
import { globals } from "../../globals";
import { Window } from "../misc/window";

export class PluginWindow extends Window {

    private plugin: CustomPlugin;

    constructor(plugin: CustomPlugin) {
        super(false);

        this.plugin = plugin;

        this.initialiseContent();
    }

    initialiseContent(): void {
        let content = readFileSync(this.plugin.getPluginPath() + "/index.html", {encoding: "ascii"});
        
        this.setContent(content);
        
        let plugin_module = require("../" + this.plugin.getPluginPath() + "/main");
        console.log(plugin_module);
        //this.plugin = new plugin_module.Plugin();
        this.plugin.initialiseUI();
        console.log(this.plugin.getAudioNode());

        this.setContentSize(450, 420);
    }

    getPlugin(): CustomPlugin {
        return this.plugin;
    }
}
