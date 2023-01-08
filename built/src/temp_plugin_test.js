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
exports.loadPlugin = void 0;
var original_fs_1 = require("original-fs");
var window_1 = require("./window");
var PluginWindow = /** @class */ (function (_super) {
    __extends(PluginWindow, _super);
    function PluginWindow(pluginpath) {
        var _this = _super.call(this, false) || this;
        _this.pluginpath = pluginpath;
        _this.initialiseContent();
        return _this;
    }
    PluginWindow.prototype.initialiseContent = function () {
        var content = (0, original_fs_1.readFileSync)(this.pluginpath + "/index.html", { encoding: "ascii" });
        this.setContent(content);
        var plugin = require("../" + this.pluginpath + "/main");
        this.plugin = new plugin.Plugin();
    };
    PluginWindow.prototype.getPlugin = function () {
        return this.plugin;
    };
    return PluginWindow;
}(window_1.Window));
function loadPlugin() {
    var pluginpath = "plugins/TestPlugin";
    var win = new PluginWindow(pluginpath);
    return win.getPlugin();
}
exports.loadPlugin = loadPlugin;
