// TODO
// - make pop-out possible

import { createElement } from "./globals";

export class Window {
    
    /* general Wrapper for every window-type in the whole app */
    
    private title: string
    private id: string
    private element: HTMLElement

    constructor() {
        this.initElement();

        this.id = Math.round(Date.now() * Math.random()).toString();
    }

    initElement() {
        let tmp = createElement(
            "<div class=\"wrapper\">\
                <div class=\"se_resize\"></div>\
                <div class=\"sw_resize\"></div>\
                <div class=\"nw_resize\"></div>\
                <div class=\"ne_resize\"></div>\
                <div class=\"toolbar\"></div>\
                <div class=\"content\"></div>\
            </div>");
        this.element = tmp;
        document.querySelector(".main_content").appendChild(this.element);

        // initialise movement/dragging listeners
        let temp_this = this;
        function windowmove(e: MouseEvent) {
            temp_this.element.style.left = Math.max(temp_this.element.offsetLeft + e.movementX, 0) + "px";
            temp_this.element.style.top = Math.max(temp_this.element.offsetTop + e.movementY, 0) + "px";
        }
        this.getToolbar().addEventListener("mousedown", () => {
            // bring to front
            this.element.style.zIndex = "2";
            document.addEventListener("mousemove", windowmove);
        });
        document.addEventListener("mouseup", () => {
            // normalize
            this.element.style.zIndex = "1";
            document.removeEventListener("mousemove", windowmove);
        });

        // initialise resizing listeners
        function addListener(element: HTMLElement, func: (e: MouseEvent) => void) {
            element.addEventListener("mousedown", () => {
                document.addEventListener("mousemove", func);
            });
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", func);
            });
        }
        addListener(this.element.querySelector(".se_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
        addListener(this.element.querySelector(".ne_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
        addListener(this.element.querySelector(".sw_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
        addListener(this.element.querySelector(".nw_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
    }

    getToolbar() {
        return this.element.querySelector(".toolbar");
    }
}

new Window();