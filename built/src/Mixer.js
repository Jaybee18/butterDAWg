"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginSlot = exports.pluginslots = void 0;
var globals_1 = require("./globals");
exports.pluginslots = [];
var PluginSlot = /** @class */ (function () {
    function PluginSlot(index) {
        this.element = null;
        this.index = index;
        this.createElement();
    }
    PluginSlot.prototype.createElement = function () {
        var a = globals_1.React.createElement("div", { className: "plugin_slot" },
            globals_1.React.createElement("div", { className: "slot_wrapper" },
                globals_1.React.createElement("i", { className: "fa-solid fa-caret-right" }),
                globals_1.React.createElement("p", null, "text"),
                globals_1.React.createElement("div", { className: "plugin_volume" },
                    globals_1.React.createElement("div", { className: "plugin_volume_knob" }))),
            globals_1.React.createElement("div", { className: "plugin_toggle" },
                globals_1.React.createElement("div", { className: "plugin_toggle_green" })));
        a.querySelector(".slot_wrapper p").innerHTML = this.index;
        this.element = a;
        var c = document.querySelector(".channel_plugins");
        c.appendChild(this.element);
    };
    PluginSlot.prototype.setName = function (name) {
        this.element.querySelector(".slot_wrapper p").innerHTML = name;
    };
    PluginSlot.prototype.setArrowEventListener = function (event, callback) {
        this.element.querySelector(".slot_wrapper i").addEventListener(event, callback);
    };
    return PluginSlot;
}());
exports.PluginSlot = PluginSlot;
