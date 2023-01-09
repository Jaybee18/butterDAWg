"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginSlot = exports.pluginslots = void 0;
exports.pluginslots = [];
var slot = '  <div class="plugin_slot">\
                    <div class="slot_wrapper">\
                        <i class="fa-solid fa-caret-right"></i>\
                            <p>Slot 1</p>\
                        <div class="plugin_volume">\
                            <div class="plugin_volume_knob"></div>\
                        </div>\
                    </div >\
                    <div class="plugin_toggle">\
                        <div class="plugin_toggle_green"></div>\
                    </div>\
                </div > ';
var PluginSlot = /** @class */ (function () {
    function PluginSlot(index) {
        this.element = null;
        this.index = index;
        this.createElement();
    }
    PluginSlot.prototype.createElement = function () {
        // TODO rewrite with custom createElement
        var a = document.createElement("div");
        a.innerHTML = slot;
        var b = a.firstElementChild;
        b.querySelector(".slot_wrapper p").innerHTML = "Slot " + this.index;
        this.element = b;
        var c = document.querySelector(".channel_plugins");
        c.appendChild(this.element);
    };
    return PluginSlot;
}());
exports.PluginSlot = PluginSlot;
