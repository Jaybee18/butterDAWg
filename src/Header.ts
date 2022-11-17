import { globals } from "./globals";

// bpm count drag functionality
var bpm_count = document.querySelector(".bpm");
var bpm_count_text = document.getElementById("bpm_count");
function bpm_drag(e) {
	globals.bpm -= e.movementY / 4;
	globals.bpm = Math.max(globals.bpm, 0);
	bpm_count_text.innerHTML = Math.round(globals.bpm).toString();
}
bpm_count.addEventListener("mousedown", () => {
	document.addEventListener("mousemove", bpm_drag);
});
document.addEventListener("mouseup", () => {
	document.removeEventListener("mousemove", bpm_drag);
});