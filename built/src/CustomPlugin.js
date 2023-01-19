"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPlugin = void 0;
var globals_1 = require("./globals");
var CustomPlugin = /** @class */ (function () {
    function CustomPlugin(pluginpath) {
        var _this = this;
        // "./plugins/TestPlugin/plugin.js"
        globals_1.globals.audiocontext.audioWorklet.addModule(pluginpath).then(function () {
            _this.initialiseAudioNode();
            _this.onAudioNodeLoaded();
            console.log("plugin loaded: " + pluginpath);
        });
    }
    CustomPlugin.prototype.getName = function () {
        return this.name;
    };
    CustomPlugin.prototype.initialiseAudioNode = function () {
        this.audio_node = new AudioWorkletNode(globals_1.globals.audiocontext, "my-custom-plugin");
        console.log(this.audio_node);
    };
    CustomPlugin.prototype.getAudioNode = function () {
        return this.audio_node;
    };
    CustomPlugin.prototype.connect = function (destination) {
        this.audio_node.connect(destination);
    };
    return CustomPlugin;
}());
exports.CustomPlugin = CustomPlugin;
