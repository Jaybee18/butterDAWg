"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Audio_1 = require("./Audio");
var globals_1 = require("./globals");
// add key event listeners
document.addEventListener("keypress", function (e) {
    if (e.code === "Space" && !globals_1.globals.deactivate_space_to_play) {
        e.preventDefault();
        (0, Audio_1.play)();
    }
});
document.addEventListener("keydown", function (e) {
    globals_1.globals.control_down = e.ctrlKey;
    globals_1.globals.alt_down = e.altKey;
});
document.addEventListener("keyup", function (e) {
    globals_1.globals.control_down = e.ctrlKey;
    globals_1.globals.alt_down = e.altKey;
});
