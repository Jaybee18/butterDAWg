"use strict";
// TODO
// - make pop-out possible
Object.defineProperty(exports, "__esModule", { value: true });
exports.Window = void 0;
var globals_1 = require("./globals");
var Window = /** @class */ (function () {
    function Window() {
        this.initElement();
        this.id = Math.round(Date.now() * Math.random()).toString();
    }
    Window.prototype.initElement = function () {
        var _this = this;
        var tmp = (0, globals_1.createElement)("<div class=\"wrapper\">\
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
        var temp_this = this;
        function windowmove(e) {
            temp_this.element.style.left = Math.max(temp_this.element.offsetLeft + e.movementX, 0) + "px";
            temp_this.element.style.top = Math.max(temp_this.element.offsetTop + e.movementY, 0) + "px";
        }
        this.getToolbar().addEventListener("mousedown", function () {
            // bring to front
            _this.element.style.zIndex = "2";
            document.addEventListener("mousemove", windowmove);
        });
        document.addEventListener("mouseup", function () {
            // normalize
            _this.element.style.zIndex = "1";
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
        addListener(this.element.querySelector(".se_resize"), function (e) {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
        addListener(this.element.querySelector(".ne_resize"), function (e) {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
        addListener(this.element.querySelector(".sw_resize"), function (e) {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
        addListener(this.element.querySelector(".nw_resize"), function (e) {
            temp_this.element.style.width = e.clientX - temp_this.element.offsetLeft + "px";
            temp_this.element.style.height = e.clientY - temp_this.element.offsetTop + "px";
        });
    };
    Window.prototype.getToolbar = function () {
        return this.element.querySelector(".toolbar");
    };
    return Window;
}());
exports.Window = Window;
new Window();
