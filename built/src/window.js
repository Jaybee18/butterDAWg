"use strict";
// TODO
// - make pop-out possible
Object.defineProperty(exports, "__esModule", { value: true });
exports.Window = void 0;
var globals_1 = require("./globals");
var electron_1 = require("electron");
var Color_1 = require("./Color");
var Window = /** @class */ (function () {
    function Window() {
        this.id = Math.round(Date.now() * Math.random()).toString();
        this.initElement();
        this.toolbar = this.element.querySelector(".toolbar");
        this.content = this.element.querySelector(".content");
        globals_1.globals.windows.push(this);
    }
    Window.prototype.initElement = function () {
        var _this = this;
        var tmp = (0, globals_1.createElement)("<div class=\"wrapper\" id=\"" + this.id + "\">\
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
        var temp_this = this;
        var sidebar_width = document.getElementById("sidebar").clientWidth;
        var header_height = document.querySelector("header").clientHeight;
        var cursor_down = { "x": 0, "y": 0 };
        var window_down = { "x": 0, "y": 0 };
        var cursor_delta = { "x": 0, "y": 0 };
        function windowmove(e) {
            temp_this.element.style.left = Math.max(e.clientX - cursor_down.x + window_down.x, sidebar_width) + "px";
            temp_this.element.style.top = Math.max(e.clientY - cursor_down.y + window_down.y, header_height) + "px";
        }
        this.get(".toolbar").addEventListener("mousedown", function (e) {
            // bring to front
            globals_1.globals.windows.forEach(function (w) {
                w.setZIndex(1);
            });
            _this.element.style.zIndex = "10";
            cursor_down.x = e.clientX;
            cursor_down.y = e.clientY;
            window_down.x = _this.element.offsetLeft;
            window_down.y = _this.element.offsetTop;
            cursor_delta.x = cursor_down.x - window_down.x;
            cursor_delta.y = cursor_down.y - window_down.y;
            document.addEventListener("mousemove", windowmove);
        });
        document.addEventListener("mouseup", function () {
            // normalize
            document.removeEventListener("mousemove", windowmove);
        });
        // initialise resizing listeners
        function addListener(element, func) {
            element.addEventListener("mousedown", function () {
                document.addEventListener("mousemove", func);
            });
            document.addEventListener("mouseup", function () {
                document.removeEventListener("mousemove", func);
            });
        }
        addListener(this.get(".se_resize"), function (e) {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
            _this.anti_minimize();
        });
        addListener(this.get(".ne_resize"), function (e) {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = temp_this.element.clientHeight - e.movementY + "px";
            temp_this.element.style.top = temp_this.element.offsetTop + e.movementY + "px";
            _this.anti_minimize();
        });
        addListener(this.get(".sw_resize"), function (e) {
            temp_this.element.style.width = temp_this.element.clientWidth - e.movementX + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
            temp_this.element.style.left = temp_this.element.offsetLeft + e.movementX + "px";
            _this.anti_minimize();
        });
        addListener(this.get(".nw_resize"), function (e) {
            temp_this.element.style.width = temp_this.element.clientWidth - e.movementX + "px";
            temp_this.element.style.height = temp_this.element.clientHeight - e.movementY + "px";
            temp_this.element.style.left = temp_this.element.offsetLeft + e.movementX + "px";
            temp_this.element.style.top = temp_this.element.offsetTop + e.movementY + "px";
            _this.anti_minimize();
        });
        // add basic toolbar buttons
        // caret for window options
        this.addToolbarButton("fa-solid fa-caret-right", new Color_1.Color("#f69238"), function (e) {
            console.log("caret right clicked on window" + _this.id);
        });
        // window minimize button
        this.addToolbarButton("fa-solid fa-window-minimize", new Color_1.Color("#f69238"), function (e) {
            _this.minimize();
        }, {
            tool: false,
            customCss: "transform: scale(0.72)"
        });
        // window maximize button
        this.addToolbarButton("fa-solid fa-window-maximize", new Color_1.Color("#f69238"), function (e) {
            _this.maximize();
        }, {
            tool: false,
            customCss: "transform: scale(0.72)"
        });
        // window close button
        this.addToolbarButton("fa-solid fa-xmark", new Color_1.Color("#ff0000"), function (e) {
            _this.close();
        }, {
            tool: false,
            customCss: "transform: scale(0.9)"
        });
        this.initialiseContent();
    };
    Window.prototype.getToolbar = function () {
        return this.get(".toolbar > .tools");
    };
    Window.prototype.getContent = function () {
        return this.content;
    };
    Window.prototype.setContent = function (content) {
        var tmp = (0, globals_1.createElement)(content);
        this.get(".content").appendChild(tmp);
    };
    Window.prototype.setZIndex = function (index) {
        this.element.style.zIndex = index.toString();
    };
    Window.prototype.setContentSize = function (width, height) {
        this.element.style.width = width + "px";
        this.element.style.height = height + "px";
    };
    Window.prototype.get = function (query) { return this.element.querySelector(query); };
    // 
    Window.prototype.addToolbarButton = function (svg, color, onClick, options) {
        var element = "<div class=\"toolbutton\"><i class=\"" + svg + "\"></i></div>";
        var tmp = (0, globals_1.createElement)(element);
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
            }
            else {
                this.get(".window_buttons").appendChild(tmp);
            }
        }
        else {
            this.getToolbar().appendChild(tmp);
        }
    };
    Window.prototype.popOut = function () {
        //ipcRenderer.on(this.id, (e) => {
        //    alert("test");
        //});
        electron_1.ipcRenderer.invoke("test", this.id, {
            width: 800,
            height: 500,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        }, "TestWindow");
    };
    Window.prototype.close = function () {
        document.querySelector(".main_content").removeChild(this.element);
    };
    Window.prototype.maximize = function () {
        var main = document.querySelector(".main_content");
        this.element.style.width = main.clientWidth + "px";
        this.element.style.height = main.clientHeight + "px";
        this.element.style.left = (0, globals_1.cumulativeOffset)(main).left + "px";
        this.element.style.top = (0, globals_1.cumulativeOffset)(main).top + "px";
    };
    Window.prototype.minimize = function () {
        this.element.style.height = "min-content";
        this.content.style.display = "none";
        this.minimized = true;
    };
    Window.prototype.anti_minimize = function () {
        this.content.style.display = "block";
        this.minimized = false;
    };
    return Window;
}());
exports.Window = Window;
