"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("./globals");
// bpm count drag functionality
var bpm_count = document.querySelector(".bpm");
var bpm_count_text = document.getElementById("bpm_count");
function bpm_drag(e) {
    globals_1.globals.bpm -= e.movementY / 4;
    globals_1.globals.bpm = Math.max(globals_1.globals.bpm, 0);
    bpm_count_text.innerHTML = Math.round(globals_1.globals.bpm).toString();
}
bpm_count.addEventListener("mousedown", function () {
    document.addEventListener("mousemove", bpm_drag);
});
document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", bpm_drag);
});
