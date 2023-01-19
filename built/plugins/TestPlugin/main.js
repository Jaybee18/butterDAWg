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
exports.Plugin = void 0;
var CustomPlugin_1 = require("../../src/CustomPlugin");
var Plugin = /** @class */ (function (_super) {
    __extends(Plugin, _super);
    function Plugin(pluginpath) {
        var _this = _super.call(this, pluginpath) || this;
        _this.name = "MyCustomPlugin";
        return _this;
        //this.initialiseUI();
    }
    Plugin.prototype.initialiseUI = function () {
        // draw those little lines and numbers on the slider
        var canvas = document.querySelector(".plugin-slider-background");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#a8a8a8";
        ctx.lineWidth = 1.5;
        ctx.font = "10pt Calibri";
        ctx.fillStyle = "#a8a8a8";
        ctx.beginPath();
        var padding = 5;
        var step = (canvas.height - padding * 2) / 20;
        for (var i = 0; i < 21; i++) {
            if (i % 2 == 0) {
                ctx.moveTo(canvas.width / 2 - 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 - 10, padding + i * step);
                ctx.moveTo(canvas.width / 2 + 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 + 10, padding + i * step);
                ctx.fillText(((10 - i / 2) * 10).toString(), canvas.width / 2 + 25, padding + i * step + 4);
            }
            else {
                ctx.moveTo(canvas.width / 2 - 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 - 15, padding + i * step);
                ctx.moveTo(canvas.width / 2 + 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 + 15, padding + i * step);
            }
        }
        ctx.stroke();
    };
    Plugin.prototype.onAudioNodeLoaded = function () {
        this.level = this.audio_node.parameters.get("level");
        // TODO put this in some other function that loads, only when the ui is loaded as a window
        // add drag functionality to the handle
        /*let handle = document.querySelector(".plugin-handle") as HTMLElement;
        let canvas = document.querySelector(".plugin-slider-background") as HTMLCanvasElement;
        let temp_this = this;
        function handleMovement(e: MouseEvent) {
            let value = Math.min(Math.max(-26, handle.offsetTop + e.movementY), canvas.height - 37);
            handle.style.top = value + "px";
            temp_this.level.value = 1 - (value + 26) / (26 + (canvas.height - 37));
            //console.log(temp_this.level.value);
        }
        handle.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", handleMovement);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", handleMovement);
        });*/
    };
    return Plugin;
}(CustomPlugin_1.CustomPlugin));
exports.Plugin = Plugin;
