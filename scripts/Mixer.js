var pluginslots = [];
const slot = '  <div class="plugin_slot">\
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

class PluginSlot {
    constructor() {
        this.element = null;

        this.createElement();
    }

    createElement() {
        let a = document.createElement("div");
        a.innerHTML = slot;
        let b = a.firstElementChild;
        this.element = b;
        let c = document.querySelector(".channel_plugins");
        c.appendChild(this.element);
    }
}

for (let i = 0; i < 10; i++) {
    pluginslots.push(new PluginSlot());
}