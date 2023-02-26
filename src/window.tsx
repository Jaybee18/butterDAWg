import { createElement, cumulativeOffset, globals, React } from "./globals";
import { BrowserWindowConstructorOptions, BrowserWindow, ipcRenderer } from "electron";
import { Color } from "./ui/misc/Color";

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
    private size: {width: number, height: number}
    private minSize: {width: number, height: number}
    private listeners: Array<{event: string, listener: (this: HTMLElement, e: Event) => any}>;

    constructor(callInitialiseContent: boolean = true) {
        this.id = Math.round(Date.now() * Math.random()).toString();
        this.initElement();
        this.toolbar = this.element.querySelector(".toolbar");
        this.content = this.element.querySelector(".content");
        globals.windows.push(this);

        this.size = {
            width: this.element.clientWidth,
            height: this.element.clientHeight,
        };
        this.minSize = {
            width: 0,
            height: 0,
        };
        this.listeners = [];

        if (callInitialiseContent) this.initialiseContent();
    }

    initElement() {
        this.element =
            <div className="wrapper" id={this.id}>
                <div className="se_resize"></div>
                <div className="sw_resize"></div>
                <div className="nw_resize"></div>
                <div className="ne_resize"></div>
                <div className="toolbar">
                    <div className="tools"></div>
                    <div className="window_buttons"></div>
                </div>
                <div className="content"></div>
            </div> as any;
        document.querySelector(".main_content").appendChild(this.element);

        // initialise movement/dragging listeners
        let temp_this = this;
        let cursor_down = { "x": 0, "y": 0 };
        let window_down = { "x": 0, "y": 0 };
        let cursor_delta = { "x": 0, "y": 0 };
        function windowmove(e: MouseEvent) {
            const sidebar_width = document.getElementById("sidebar").clientWidth;
            const header_height = document.querySelector("header").clientHeight;
            temp_this.element.style.left = Math.max(e.clientX - cursor_down.x + window_down.x, sidebar_width) + "px";
            temp_this.element.style.top = Math.max(e.clientY - cursor_down.y + window_down.y, header_height) + "px";

            temp_this.setContentSize();
        }
        this.get(".toolbar").addEventListener("mousedown", (e) => {
            // save some attributes for window dragging
            cursor_down.x = e.clientX;
            cursor_down.y = e.clientY;
            window_down.x = this.element.offsetLeft;
            window_down.y = this.element.offsetTop;
            cursor_delta.x = cursor_down.x - window_down.x;
            cursor_delta.y = cursor_down.y - window_down.y;

            document.addEventListener("mousemove", windowmove);
        });
        document.addEventListener("mouseup", () => {
            // normalize
            document.removeEventListener("mousemove", windowmove);
        });
        this.element.addEventListener("mousedown", (e) => {
            // it looks ugly for the window to very briefly appear 
            // (for like 1 frame) only to be closed right after, so
            // don't even bring it to the front if it's going to get
            // closed anyway
            if (e.target !== this.get(".fa-xmark")) {
                // bring to front
                globals.windows.forEach((w) => {
                    w.setZIndex(1);
                });
                this.element.style.zIndex = "10";
            }
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
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = temp_this.element.clientHeight - e.movementY + "px";
            temp_this.element.style.top = temp_this.element.offsetTop + e.movementY + "px";
            this.anti_minimize();
        });
        addListener(this.get(".sw_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = temp_this.element.clientWidth - e.movementX + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
            temp_this.element.style.left = temp_this.element.offsetLeft + e.movementX + "px";
            this.anti_minimize();
        });
        addListener(this.get(".nw_resize"), (e: MouseEvent) => {
            temp_this.element.style.width = temp_this.element.clientWidth - e.movementX + "px";
            temp_this.element.style.height = temp_this.element.clientHeight - e.movementY + "px";
            temp_this.element.style.left = temp_this.element.offsetLeft + e.movementX + "px";
            temp_this.element.style.top = temp_this.element.offsetTop + e.movementY + "px";
            this.anti_minimize();
        });

        // add basic toolbar buttons
        // caret for window options
        this.addToolbarButton("fa-solid fa-caret-right", new Color("#f69238"), (e: MouseEvent) => {
            console.log("caret right clicked on window" + this.id);
        });
        // window minimize button
        this.addToolbarButton("fa-solid fa-window-minimize", new Color("#f69238"), (e: MouseEvent) => {
            this.minimize();
        }, {
            tool: false,
            customCss: "transform: scale(0.72)"
        } as toolbarButtonOptions);
        // window maximize button
        this.addToolbarButton("fa-solid fa-window-maximize", new Color("#f69238"), (e: MouseEvent) => {
            this.maximize();
        }, {
            tool: false,
            customCss: "transform: scale(0.72)"
        } as toolbarButtonOptions);
        // window close button
        this.addToolbarButton("fa-solid fa-xmark", new Color("#ff0000"), (e: MouseEvent) => {
            this.close();
        }, {
            tool: false,
            customCss: "transform: scale(0.9)"
        } as toolbarButtonOptions);
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

    setContentSize(width: number = undefined, height: number = undefined) {
        // if width and height are undefined, this should just
        // act like a size update function
        if (width === undefined && height === undefined) {
            if (cumulativeOffset(this.element).left + this.element.clientWidth > window.innerWidth) {
                width = window.innerWidth - cumulativeOffset(this.element).left;
                height = this.element.clientHeight;
            } else if (window.innerWidth - cumulativeOffset(this.element).left < this.size.width) {
                width = window.innerWidth - cumulativeOffset(this.element).left;
            }

            let pos = cumulativeOffset(this.element);
            if (pos.left + this.element.clientWidth > window.innerWidth) {
                width = window.innerWidth - pos.left;
            } else if (window.innerWidth - pos.left < this.size.width) {
                width = window.innerWidth - pos.left;
            }
            if (pos.top + this.element.clientHeight > window.innerHeight) {
                height = window.innerHeight - pos.top;
            } else if (window.innerHeight - pos.top < this.size.height) {
                height = window.innerHeight - pos.top;
            }

        } else {
            this.size = {width: width, height: height};
        }

        this.element.style.width = Math.max(Math.min(width, this.size.width), this.minSize.width) + "px";
        this.element.style.height = Math.max(Math.min(this.size.height, height), this.minSize.height) + "px";
        this.onResizeContent(this.element.clientWidth, this.element.clientHeight);
    }

    setMinWindowSize(minWidth: number, minHeight: number) {
        this.minSize = {
            width: minWidth,
            height: minHeight,
        };
    }

    // resize method that gets called on window resize events
    onResizeContent(newWidth: number, newHeight: number) { }

    // close method that gets called when the window gets the command to close itself
    onClose() { }

    protected get(query: string): HTMLElement { return this.element.querySelector(query); }

    // 
    protected addToolbarButton(svg: string, color: Color, onClick: (e: MouseEvent) => void, options?: toolbarButtonOptions) {
        let element = "<div class=\"toolbutton\"><i class=\"" + svg + "\"></i></div>";
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

    // method for adding an event listener to the window.
    // this aims to prevent adding document wide listeners that would
    // have to be manually/painfully removed when deleting the window.
    // and also: the window handles the active/passive/background tracking
    // and knows best when to disable/enable these listeners
    addEventListener(event: string, listener: (this: HTMLElement, e: Event) => any) {
        this.listeners.push({event: event, listener: listener});
        document.addEventListener(event, listener);
    }

    popOut() {
        //ipcRenderer.on(this.id, (e) => {
        //    alert("test");
        //});
        ipcRenderer.invoke("test", this.id, {
            width: 800,
            height: 500,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            } as BrowserWindowConstructorOptions
        }, "TestWindow");
    }

    close() {
        this.onClose();

        // remove all listeners attached to this window
        this.listeners.forEach(element => {
            document.removeEventListener(element.event, element.listener);
        });

        document.querySelector(".main_content").removeChild(this.element);
        globals.windows.splice(globals.windows.indexOf(this), 1);
    }

    maximize() {
        let main = document.querySelector(".main_content") as HTMLElement;
        this.element.style.width = main.clientWidth + "px";
        this.element.style.height = main.clientHeight + "px";
        this.element.style.left = cumulativeOffset(main).left + "px";
        this.element.style.top = cumulativeOffset(main).top + "px";
        this.updateSize();
        this.onResizeContent(this.element.clientWidth, this.element.clientHeight);
    }

    minimize() {
        this.element.style.height = "min-content";
        this.content.style.display = "none";
        this.minimized = true;
        this.updateSize();
        this.onResizeContent(this.element.clientWidth, this.element.clientHeight);
    }

    anti_minimize() {
        this.content.style.display = "block";
        this.minimized = false;
        this.updateSize();
        this.onResizeContent(this.element.clientWidth, this.element.clientHeight);
    }

    private updateSize() {
        this.size = {width: this.element.clientWidth, height: this.element.clientHeight};
    }
}
