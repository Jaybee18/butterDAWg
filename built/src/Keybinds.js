"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupKeybinds = void 0;
var globals_1 = require("./globals");
// add key event listeners
function setupKeybinds() {
    /*document.addEventListener("keypress", (e) => {
        if (e.code === "Space" && !globals.deactivate_space_to_play) {
            e.preventDefault();
            play();
        }
    });*/
    document.addEventListener("keydown", function (e) {
        globals_1.globals.control_down = e.ctrlKey;
        globals_1.globals.alt_down = e.altKey;
    });
    document.addEventListener("keyup", function (e) {
        globals_1.globals.control_down = e.ctrlKey;
        globals_1.globals.alt_down = e.altKey;
    });
}
exports.setupKeybinds = setupKeybinds;
