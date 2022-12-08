"use strict";
var pluginslots = [];
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
for (var i = 0; i < 10; i++) {
    pluginslots.push(new PluginSlot(i));
}
