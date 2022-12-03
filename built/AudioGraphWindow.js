"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var window_1 = require("./window");
var fs_1 = require("fs");
var Source_1 = require("./Source");
var AudioGraph_1 = require("./AudioGraph");
var Plugin_1 = require("./Plugin");
var globals_1 = require("./globals");
var AudioGraph = /** @class */ (function (_super) {
    __extends(AudioGraph, _super);
    function AudioGraph() {
        return _super.call(this) || this;
    }
    AudioGraph.prototype.initialiseContent = function () {
        this.setContent("<div class=\"audio_graph_screen\" id=\"audiograph\">\
            <div class=\"retro\"></div>\
            <canvas class=\"grid_background\" width=\"1000\" height=\"1000\"></canvas>\
            </div>");
        // first load all possible audio plugins, then initialise some testing audio nodes
        var plugin_promises = (0, fs_1.readdirSync)("AudioNodes").map(function (v) {
            return globals_1.globals.audiocontext.audioWorklet.addModule("AudioNodes/" + v);
        });
        Promise.allSettled(plugin_promises).then(function () {
            var source = new Source_1.Source("./files/0Current project/kick7.1.wav");
            var node1 = new AudioGraph_1.AudioGraphSourceNode(source);
            var node4 = new AudioGraph_1.PluginNode(new Plugin_1.Plugin("AudioNodes/passthrough.js"));
            var node5 = new AudioGraph_1.PluginNode(new Plugin_1.Plugin("AudioNodes/bitcrusher.js"));
            var node3 = new AudioGraph_1.AudioGraphAnalyzerNode();
            var node2 = new AudioGraph_1.AudioGraphOutputNode(globals_1.globals.audiocontext.destination);
            node1.connect(node4);
            node4.connect(node5);
            node5.connect(node3);
            node3.connect(node2);
        });
        // initialize screen drag listener
        function screendrag(e) {
            globals_1.globals.audio_graph_nodes.forEach(function (element) {
                var tmp = element.getElement();
                tmp.style.left = tmp.offsetLeft + e.movementX + "px";
                tmp.style.top = tmp.offsetTop + e.movementY + "px";
            });
        }
        this.element.querySelector(".content").addEventListener("mousedown", function (e) {
            if (e.button === 1) {
                document.addEventListener("mousemove", screendrag);
            }
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", screendrag);
        });
        this.setContentSize(1200, 700);
    };
    return AudioGraph;
}(window_1.Window));
var audio_graph = new AudioGraph();
//let tet = window.open("");
//tet.document.write(audio_graph.getContent().innerHTML);
var electron_1 = require("electron");
electron_1.ipcRenderer.invoke("test", "penis", {
    width: 200,
    height: 100,
});
