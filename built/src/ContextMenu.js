"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenu = void 0;
var globals_1 = require("./globals");
var ContextMenu = /** @class */ (function () {
    function ContextMenu(items, listeners) {
        this.element = null;
        this.id = Math.round(Date.now() * Math.random());
        // items is a list of strings representing the items of the context menu
        // a string called "[spacer]" will act as a spacer
        this.items = items.filter(function (value, i, a) { return value !== "[spacer]"; });
        this.raw_items = items;
        // this will be set to the parent context menu to also toggle
        // it if this context menu gets toggled
        this.parent_buffer = null;
        this.createElement();
        this.addToDocument();
        this.addEventListeners(listeners);
    }
    ContextMenu.prototype.createElement = function () {
        var a = "";
        this.raw_items.forEach(function (item) {
            if (item !== "[spacer]") {
                a += '<div class="context_item">' + item + '</div>';
            }
            else {
                a += '<div class="context_spacer"></div>';
            }
        });
        var b = document.createElement("div");
        b.classList.add("context_menu");
        b.id = this.id.toString();
        b.innerHTML = a;
        this.element = b;
    };
    ContextMenu.prototype.addToDocument = function () {
        var _this = this;
        var temp_this = this;
        document.body.appendChild(this.element);
        document.addEventListener("click", function (e) {
            if (temp_this.element.style.display === "block" && e.target.offsetParent !== _this.element &&
                !e.target.parentElement.classList.contains("context_menu")) {
                temp_this.toggle();
            }
        });
    };
    ContextMenu.prototype.toggle = function (e) {
        // e is the event that triggered the context menu popup
        // it will provide the location the menu should be displayed
        if (this.element.style.display === "block") {
            this.element.style.display = "none";
        }
        else {
            // if this is a submenu, aka the clicked element is a context_item, spawn
            // the context menu offset by the parents position on the screen. Else just
            // spawn it at the mouse cursor
            if (e.target.classList.contains("context_item")) {
                this.element.style.top = e.target.offsetTop + e.target.offsetParent.offsetTop + "px";
                this.element.style.left = e.target.offsetLeft + e.target.offsetParent.offsetLeft + e.target.offsetParent.clientWidth + "px";
            }
            else {
                this.element.style.top = e.clientY + "px";
                this.element.style.left = e.clientX + "px";
            }
            this.element.style.display = "block";
            globals_1.globals.context_menus.push(this);
        }
    };
    ContextMenu.prototype.addEventListeners = function (listeners) {
        var _loop_1 = function (i, j) {
            if (this_1.raw_items[i] === "[spacer]" || listeners[j] === null) {
                return "continue";
            }
            var item = this_1.element.querySelector(".context_item:nth-child(" + (i + 1) + ")");
            item.addEventListener("click", function (e) {
                if (listeners[j](e)) {
                    globals_1.globals.context_menus.forEach(function (element) {
                        element.toggle();
                    });
                }
            });
        };
        var this_1 = this;
        // listeners should return true, if the context menu window should be closed after clicking
        for (var i = 0, j = 0; i < this.raw_items.length; i++, j += this.raw_items[i] === "[spacer]" ? 0 : 1) {
            _loop_1(i, j);
        }
    };
    return ContextMenu;
}());
exports.ContextMenu = ContextMenu;
