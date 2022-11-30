"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
var Plugin = /** @class */ (function () {
    function Plugin(path) {
        this.path = path;
        this.name = "<placeholder>";
        this.loadPlugin();
    }
    Plugin.prototype.loadPlugin = function () {
        var _this = this;
        this.audiocontext.audioWorklet.addModule(this.path).then(function () {
            console.log("successfully loaded " + _this.name + "-plugin");
        });
    };
    Plugin.prototype.getName = function () {
        return this.name;
    };
    Plugin.prototype.getNumInputs = function () {
        throw new Error("not implemented");
    };
    Plugin.prototype.getNumOutputs = function () {
        throw new Error("not implemented");
    };
    return Plugin;
}());
exports.Plugin = Plugin;
