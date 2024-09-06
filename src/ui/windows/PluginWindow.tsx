import { Window } from "../misc/window";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from 'uuid';

export class PluginWindow extends Window {

    private pluginId: string;
    private audioNode: AudioWorkletNode;

    constructor(audioNode: AudioWorkletNode) {
        super(false);

        // ids have to start with a letter
        this.pluginId = "islkdfsoinfs";
        this.audioNode = audioNode;

        this.setResizable(false);
        this.initialiseContent();
    }
    initialiseContent(): void {
        const pluginPath = "SimpleDistortion/";
        const htmlPath = pluginPath + "plugin.html";
        const htmlContent = readFileSync(htmlPath, "utf-8");
        const hostPath = pluginPath + "host.js";
        const hostContent = readFileSync(hostPath, "utf-8");

        // load html into dom
        const container = document.createElement("div");
        container.id = this.pluginId;
        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        this.setContent(htmlContent);

        // load plugin js
        const initializePlugin = eval(hostContent);
        initializePlugin(
            this.pluginId,
            this.audioNode,
        );
    }
}