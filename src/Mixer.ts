export var pluginslots: Array<PluginSlot> = [];
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

export class PluginSlot {

    element: HTMLElement;
    index: number;

    constructor(index: number) {
        this.element = null;
        this.index = index;

        this.createElement();
    }

    createElement() {
        // TODO rewrite with custom createElement
        let a = document.createElement("div");
        a.innerHTML = slot;
        let b = <HTMLElement> a.firstElementChild;
        b.querySelector(".slot_wrapper p").innerHTML = "Slot " + this.index;
        this.element = b;
        let c = document.querySelector(".channel_plugins");
        c.appendChild(this.element);
    }
}
