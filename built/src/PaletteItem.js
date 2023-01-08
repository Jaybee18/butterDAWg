"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var wavefile_1 = require("wavefile");
var globals_1 = require("./globals");
var fs_1 = require("fs");
var Item = /** @class */ (function (_super) {
    __extends(Item, _super);
    function Item(title, contents, indent) {
        if (indent === void 0) { indent = 0; }
        var _this = _super.call(this) || this;
        _this.file = null;
        _this.contents = contents;
        _this.active = false;
        _this.indent = indent;
        _this.children = [];
        _this.title = title;
        _this.depth_max = 1.0;
        // construct container
        var a = document.createElement("div");
        a.classList.add("sidebar_item_lvl1");
        var dedicated_color = globals_1.sidebar_folder_colors[title];
        a.style.color = dedicated_color === undefined ? "var(--bg-light)" : dedicated_color;
        a.style.marginLeft = indent * globals_1.globals.palette_indent_width + "px";
        _this.element = a;
        // add icon
        // TODO display a little loading circle while the sample is being loaded in, when the user opens a folder
        var ending = title.split(".").pop();
        if (ending === "wav") {
            var type_icon = document.createElement("i");
            type_icon.classList.add("fa-solid");
            type_icon.classList.add("fa-file-audio");
            _this.loadData();
            _this.initializeDragListener();
        }
        else if (title === ending) {
            var type_icon = document.createElement("i");
            type_icon.classList.add("fa-regular");
            type_icon.classList.add("fa-folder");
        }
        else {
            var type_icon = document.createElement("i");
            type_icon.classList.add("fa-solid");
            type_icon.classList.add("fa-file");
        }
        a.appendChild(type_icon);
        // add text object
        var b = document.createElement("div");
        b.classList.add("sidebar_item_lvl1_text");
        b.innerHTML = title;
        a.appendChild(b);
        _this.initializeEventListeners();
        return _this;
    }
    Item.prototype.loadData = function () {
        // Load a wav file buffer as a WaveFile object
        this.file = new wavefile_1.WaveFile((0, fs_1.readFileSync)(this.contents));
        if (this.file.bitDepth !== "32f") {
            this.file.toBitDepth("32f");
        }
        this.depth = this.file.bitDepth;
    };
    Item.prototype.getData = function () {
        return this.file.getSamples(true);
    };
    Item.prototype.getWidth = function () {
        // returns the sample size in frames as an integer
        return this.file.chunkSize;
    };
    Item.prototype.getDuration = function () {
        // returns duration in seconds
        return this.getData().length / globals_1.globals.sample_rate / 2;
    };
    Item.prototype.initializeEventListeners = function () {
        var _this = this;
        this.element.addEventListener("click", function () {
            if (_this.contents === undefined) {
                return;
            }
            if (_this.active) {
                _this.active = false;
                _this.close();
            }
            else {
                _this.active = true;
                _this.open();
            }
        });
    };
    Item.prototype.getDragElement = function () {
        return this.element.children[1];
    };
    Item.prototype.close = function () {
        if (this.contents === undefined) {
            this.element.remove();
            return;
        }
        this.children.forEach(function (item) {
            item.close();
            item.remove();
        });
        this.children = [];
    };
    Item.prototype.open = function () {
        var _this = this;
        // if this item is a folder, open it
        if (this.contents === undefined) {
            return;
        }
        this.contents.forEach(function (element, key) {
            var a = new Item(key, element, _this.indent + 1);
            a.appendAfter(_this.element);
            _this.children.push(a);
        });
    };
    Item.prototype.remove = function () {
        this.element.remove();
    };
    Item.prototype.appendToSidebar = function () {
        globals_1.globals.sidebar.appendChild(this.element);
    };
    Item.prototype.appendAfter = function (element) {
        this.element.style.color = element.style.color;
        (0, globals_1.insertAfter)(this.element, element);
    };
    return Item;
}(globals_1.Draggable));
exports.Item = Item;
