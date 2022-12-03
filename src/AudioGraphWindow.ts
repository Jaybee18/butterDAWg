import { Window } from "./window";
import { readdirSync } from "fs";
import { Source } from "./Source";
import { AudioGraphAnalyzerNode, AudioGraphOutputNode, AudioGraphSourceNode, PluginNode } from "./AudioGraph";
import { Plugin } from "./Plugin";
import { globals } from "./globals";

class AudioGraph extends Window {
    constructor() {
        super();
    }

    initialiseContent(): void {
        this.setContent("<div class=\"audio_graph_screen\" id=\"audiograph\">\
            <div class=\"retro\"></div>\
            <canvas class=\"grid_background\" width=\"1000\" height=\"1000\"></canvas>\
            </div>");

        // first load all possible audio plugins, then initialise some testing audio nodes
        let plugin_promises = readdirSync("AudioNodes").map((v) => {
            return globals.audiocontext.audioWorklet.addModule("AudioNodes/" + v);
        });
        Promise.allSettled(plugin_promises).then(() => {
            let source = new Source("./files/0Current project/kick7.1.wav");
            let node1 = new AudioGraphSourceNode(source);
            let node4 = new PluginNode(new Plugin("AudioNodes/passthrough.js"));
            let node5 = new PluginNode(new Plugin("AudioNodes/bitcrusher.js"));
            let node3 = new AudioGraphAnalyzerNode();
            let node2 = new AudioGraphOutputNode(globals.audiocontext.destination);

            node1.connect(node4);
            node4.connect(node5);
            node5.connect(node3);
            node3.connect(node2);
        });

        // initialize screen drag listener
        function screendrag(e: MouseEvent) {
            globals.audio_graph_nodes.forEach(element => {
                let tmp = element.getElement();
                tmp.style.left = tmp.offsetLeft + e.movementX + "px";
                tmp.style.top = tmp.offsetTop + e.movementY + "px";
            });
        }
        (<HTMLElement> this.element.querySelector(".content")).addEventListener("mousedown", (e: MouseEvent) => {
            if (e.button === 1) {
                document.addEventListener("mousemove", screendrag);
            }
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", screendrag);
        });

        this.setContentSize(1200, 700);
    }
}

let audio_graph = new AudioGraph();
//let tet = window.open("");
//tet.document.write(audio_graph.getContent().innerHTML);

import { BrowserViewConstructorOptions, ipcRenderer } from "electron";
ipcRenderer.invoke("test", "penis", <BrowserViewConstructorOptions> {
    width: 200,
    height: 100,
});