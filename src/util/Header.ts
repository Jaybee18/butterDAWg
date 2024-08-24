import { globals } from "../globals";
import { PlaylistWindow } from "../ui/windows/PlaylistWindow";
import { MixerWindow } from "../ui/windows/MixerWindow";
import { WindowType } from "../ui/misc/window";
import { AudioGraphWindow } from "../ui/windows/AudioGraphWindow";

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

// mixer
document.querySelector(".header_mixer").addEventListener("click", () => {
  if (windowTypeOpen(WindowType.Mixer)) {
    console.log("mixer window already open");
  } else {
    console.log("open mixer window");
    new MixerWindow();
  }
});

// playlist
document.querySelector(".header_playlist").addEventListener("click", () => {
  if (windowTypeOpen(WindowType.Playlist)) {
    console.log("playlist window already open");
  } else {
    console.log("open playlist window");
    new PlaylistWindow();
  }
});

// audio graph
document.querySelector(".header_audio_graph").addEventListener("click", () => {
    new AudioGraphWindow();
});

export function windowTypeOpen(windowType: WindowType): boolean {
  for (let i = 0; i < globals.windows.length; i++) {
    const type = globals.windows[i].getType();
    if (type !== undefined && type == windowType) {
      return true;
    }
  }
  return false;
}