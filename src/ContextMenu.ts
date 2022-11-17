import { globals } from "./globals";

export class ContextMenu {

    element: HTMLElement;
    id: number;
    items: Array<string>;
    raw_items: Array<string>;
    parent_buffer: ContextMenu;

    constructor(items: Array<string>, listeners: Array<Function>) {
        this.element = null;
        this.id = Math.round(Date.now() * Math.random());

        // items is a list of strings representing the items of the context menu
        // a string called "[spacer]" will act as a spacer
        this.items = items.filter((value, i, a) => {return value!=="[spacer]";});
        this.raw_items = items;

        // this will be set to the parent context menu to also toggle
        // it if this context menu gets toggled
        this.parent_buffer = null;

        this.createElement();
        this.addToDocument();
        this.addEventListeners(listeners);
    }

    createElement() {
        let a = "";
        this.raw_items.forEach(item => {
            if (item !== "[spacer]") {
                a += '<div class="context_item">' + item + '</div>';
            } else {
                a += '<div class="context_spacer"></div>';
            }
        });
        
        let b = document.createElement("div");
        b.classList.add("context_menu");
        b.id = this.id.toString();
        b.innerHTML = a;
        this.element = b;
    }

    addToDocument() {
        let temp_this = this;
        document.body.appendChild(this.element);
        document.addEventListener("click", (e: MouseEvent) => {
            if (temp_this.element.style.display==="block" && (<HTMLElement> e.target).offsetParent !== this.element &&
                !(<HTMLElement> e.target).parentElement.classList.contains("context_menu")) {
                temp_this.toggle();
            }
        });
    }

    toggle(e?: MouseEvent) {
        // e is the event that triggered the context menu popup
        // it will provide the location the menu should be displayed
        if (this.element.style.display === "block") {
            this.element.style.display = "none";
        } else {
            // if this is a submenu, aka the clicked element is a context_item, spawn
            // the context menu offset by the parents position on the screen. Else just
            // spawn it at the mouse cursor
            if ((<HTMLElement> e.target).classList.contains("context_item")) {
                this.element.style.top = (<HTMLElement> e.target).offsetTop + (<HTMLElement> (<HTMLElement> e.target).offsetParent).offsetTop + "px";
                this.element.style.left = (<HTMLElement> e.target).offsetLeft + (<HTMLElement> (<HTMLElement> e.target).offsetParent).offsetLeft + (<HTMLElement> e.target).offsetParent.clientWidth+ "px";
            } else {
                this.element.style.top = e.clientY + "px";
                this.element.style.left = e.clientX + "px";
            }
            this.element.style.display = "block";
            globals.context_menus.push(this);
        }
    }

    addEventListeners(listeners) {
        // listeners should return true, if the context menu window should be closed after clicking
        for (let i = 0, j = 0; i < this.raw_items.length; i++, j+=this.raw_items[i]==="[spacer]"?0:1) {
            if (this.raw_items[i] === "[spacer]" || listeners[j] === null) {continue;}

            let item = this.element.querySelector(".context_item:nth-child(" + (i+1) + ")");
            item.addEventListener("click", (e) => {
                if (listeners[j](e)) {
                    globals.context_menus.forEach(element => {
                        element.toggle();
                    });
                }
            });
        }
    }
}