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
// header controls scope buttons
var scope_pat = document.querySelector(".scope_pat");
var scope_song = document.querySelector(".scope_song");
scope_pat.addEventListener("click", function () {
    if (!scope_pat.classList.contains("scope_pat_clicked")) {
        scope_pat.classList.add("scope_pat_clicked");
        scope_song.classList.remove("scope_song_clicked");
    }
});
scope_song.addEventListener("click", function () {
    if (!scope_song.classList.contains("scope_song_clicked")) {
        scope_song.classList.add("scope_song_clicked");
        scope_pat.classList.remove("scope_pat_clicked");
    }
});
scope_pat.click();
