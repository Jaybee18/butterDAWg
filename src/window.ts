// TODO
// - make pop-out possible

import { createElement, cumulativeOffset, globals } from "./globals";
import { BrowserWindowConstructorOptions, BrowserWindow, ipcRenderer } from "electron";
import { Color } from "./Color";

export interface toolbarButtonOptions {
    tool: boolean
    customCss: string
    customParentCss: string
}

export abstract class Window {
    
    /* general Wrapper for every window-type in the whole app */
    
    private title: string
    private id: string
    protected element: HTMLElement
    protected toolbar: HTMLElement
    protected content: HTMLElement
    private minimized: boolean

    constructor() {
        this.id = Math.round(Date.now() * Math.random()).toString();
        this.initElement();
        this.toolbar = this.element.querySelector(".toolbar");
        this.content = this.element.querySelector(".content");
        globals.windows.push(this);
    }

    initElement() {
        let tmp = createElement(
            "<div class=\"wrapper\" id=\""+this.id+"\">\
                <div class=\"se_resize\"></div>\
                <div class=\"sw_resize\"></div>\
                <div class=\"nw_resize\"></div>\
                <div class=\"ne_resize\"></div>\
                <div class=\"toolbar\">\
                    <div class=\"tools\"></div>\
                    <div class=\"window_buttons\"></div>\
                </div>\
                <div class=\"content\"></div>\
            </div>");
        this.element = tmp;
        document.querySelector(".main_content").appendChild(this.element);

        // initialise movement/dragging listeners
        let temp_this = this;
        const sidebar_width = document.getElementById("sidebar").clientWidth;
        const header_height = document.querySelector("header").clientHeight;
        function windowmove(e: MouseEvent) {
            temp_this.element.style.left = Math.max(temp_this.element.offsetLeft + e.movementX, sidebar_width) + "px";
            temp_this.element.style.top = Math.max(temp_this.element.offsetTop + e.movementY, header_height) + "px";
        }
        this.get(".toolbar").addEventListener("mousedown", () => {
            // bring to front
            globals.windows.forEach((w) => {
                w.setZIndex(1);
            });
            this.element.style.zIndex = "10";
            document.addEventListener("mousemove", windowmove);
        });
        document.addEventListener("mouseup", () => {
            // normalize
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
        addListener(this.get(".se_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
            this.anti_minimize();
        });
        addListener(this.get(".ne_resize"), (e: MouseEvent) => {
            console.log("not implemented");
        });
        addListener(this.get(".sw_resize"), (e: MouseEvent) => {
            console.log("not implemented");
        });
        addListener(this.get(".nw_resize"), (e: MouseEvent) => {
            console.log("not implemented");
        });

        // add basic toolbar buttons
        // caret for window options
        this.addToolbarButton("fa-solid fa-caret-right", new Color("#f69238"), (e: MouseEvent) => {
            console.log("caret right clicked on window"+this.id);
        });
        // window minimize button
        this.addToolbarButton("fa-solid fa-window-minimize", new Color("#f69238"), (e: MouseEvent) => {
            this.minimize();
        }, <toolbarButtonOptions> {
            tool: false,
            customCss: "transform: scale(0.72)"
        });
        // window maximize button
        this.addToolbarButton("fa-solid fa-window-maximize", new Color("#f69238"), (e: MouseEvent) => {
            this.maximize();
        }, <toolbarButtonOptions> {
            tool: false,
            customCss: "transform: scale(0.72)"
        });
        // window close button
        this.addToolbarButton("fa-solid fa-xmark", new Color("#ff0000"), (e: MouseEvent) => {
            this.close();
        }, <toolbarButtonOptions> {
            tool: false,
            customCss: "transform: scale(0.9)"
        });

        this.initialiseContent();
    }

    getToolbar() {
        return this.get(".toolbar > .tools");
    }

    abstract initialiseContent(): void;

    getContent() {
        return this.content;
    }

    setContent(content: string) {
        let tmp = createElement(content);
        this.get(".content").appendChild(tmp);
    }

    setZIndex(index: number) {
        this.element.style.zIndex = index.toString();
    }

    setContentSize(width: number, height: number) {
        this.element.style.width = width + "px";
        this.element.style.height = height + "px";
    }

    protected get(query: string): HTMLElement {return this.element.querySelector(query);}

    // 
    protected addToolbarButton(svg: string, color: Color, onClick: (e: MouseEvent) => void, options?: toolbarButtonOptions) {
        let element = "<div class=\"toolbutton\"><i class=\""+svg+"\"></i></div>";
        let tmp = createElement(element);
        tmp.style.cssText = "--custom: " + color.color;
        tmp.addEventListener("click", onClick);

        if (options !== undefined) {
            if (options.customCss !== undefined) {
                tmp.querySelector("i").style.cssText += options.customCss;
            }

            if (options.customParentCss !== undefined) {
                tmp.style.cssText += options.customParentCss;
            }
    
            // if the button is a tool, add it to the tool side
            // else its a window control button
            if (options.tool === undefined || options.tool) {
                this.getToolbar().appendChild(tmp);
            } else {
                this.get(".window_buttons").appendChild(tmp);
            }
        } else {
            this.getToolbar().appendChild(tmp);
        }
    }

    popOut() {
        //ipcRenderer.on(this.id, (e) => {
        //    alert("test");
        //});
        ipcRenderer.invoke("test", this.id, <BrowserWindowConstructorOptions> {
            width: 800,
            height: 500,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        }, "TestWindow");
    }

    close() {
        document.querySelector(".main_content").removeChild(this.element);
    }

    maximize() {
        let main = <HTMLElement> document.querySelector(".main_content");
        this.element.style.width = main.clientWidth + "px";
        this.element.style.height = main.clientHeight + "px";
        this.element.style.left = cumulativeOffset(main).left + "px";
        this.element.style.top = cumulativeOffset(main).top + "px";
    }

    minimize() {
        this.element.style.height = "min-content";
        this.content.style.display = "none";
        this.minimized = true;
    }

    anti_minimize() {
        this.content.style.display = "block";
        this.minimized = false;
    }
}
