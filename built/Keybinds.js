"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Audio_1 = require("./Audio");
var globals_1 = require("./globals");
// add key event listeners
var control_down = false;
var alt_down = false;
document.addEventListener("keypress", function (e) {
    if (e.code === "Space" && !globals_1.globals.deactivate_space_to_play) {
        e.preventDefault();
        (0, Audio_1.play)();
    }
});
document.addEventListener("keydown", function (e) {
    control_down = e.ctrlKey;
    alt_down = e.altKey;
});
document.addEventListener("keyup", function (e) {
    control_down = e.ctrlKey;
    alt_down = e.altKey;
});
