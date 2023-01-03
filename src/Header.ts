import { globals } from "./globals";

// bpm count drag functionality
var bpm_count = document.querySelector(".bpm");
var bpm_count_text = document.getElementById("bpm_count");
function bpm_drag(e: MouseEvent) {
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

// header controls scope buttons
var scope_pat = <HTMLElement> document.querySelector(".scope_pat");
var scope_song = document.querySelector(".scope_song");
scope_pat.addEventListener("click", () => {
  if (!scope_pat.classList.contains("scope_pat_clicked")){
    scope_pat.classList.add("scope_pat_clicked");
    scope_song.classList.remove("scope_song_clicked");
  }
});
scope_song.addEventListener("click", () => {
  if (!scope_song.classList.contains("scope_song_clicked")){
    scope_song.classList.add("scope_song_clicked");
    scope_pat.classList.remove("scope_pat_clicked");
  }
});
scope_pat.click();