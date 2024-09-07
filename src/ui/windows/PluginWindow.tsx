import { Window } from "../misc/window";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from 'uuid';
import { Plugin } from "../../core/Plugin";

export class PluginWindow extends Window {

    private plugin: Plugin;
    private pluginId: string;

    constructor(plugin: Plugin) {
        super(false);

        this.plugin = plugin;

        // ids have to start with a letter
        this.pluginId = "p-" + uuidv4();

        this.setResizable(false);
        this.initialiseContent();
    }
    initialiseContent(): void {
        const pluginPath = "/Users/jbes/GitHub/butterDAWg/SimpleDistortion.bdp/";
        const htmlPath = pluginPath + "plugin.html";
        const htmlContent = readFileSync(htmlPath, "utf-8");
        const hostPath = pluginPath + "host.js";
        const hostContent = readFileSync(hostPath, "utf-8");

        this.setContent(`<div id="${this.pluginId}">${htmlContent}</div>`);

        // load plugin js
        const initializePlugin = eval(hostContent);
        initializePlugin(
            this.pluginId,
            this.plugin.getAudioNode(),
        );
    }
}