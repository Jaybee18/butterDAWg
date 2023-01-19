import { React, globals } from "./globals";
import { ContextMenu } from "./ContextMenu";

export var pluginslots: Array<PluginSlot> = [];

export class PluginSlot {

    element: HTMLElement;
    index: any;

    constructor(index: any) {
        this.element = null;
        this.index = index;

        this.createElement();
    }

    createElement() {

        let a = <div className="plugin_slot">
            <div className="slot_wrapper">
                <i className="fa-solid fa-caret-right"></i>
                <p>text</p>
                <div className="plugin_volume">
                    <div className="plugin_volume_knob"></div>
                </div>
            </div >
            <div className="plugin_toggle">
                <div className="plugin_toggle_green"></div>
            </div>
        </div > as any;

        a.querySelector(".slot_wrapper p").innerHTML = this.index;

        this.element = a;

        let c = document.querySelector(".channel_plugins");
        c.appendChild(this.element);
    }

    setName(name: string) {
        this.element.querySelector(".slot_wrapper p").innerHTML = name;
    }

    setArrowEventListener(event: string, callback: (e: Event) => void) {
        this.element.querySelector(".slot_wrapper i").addEventListener(event, callback);
    }
}
