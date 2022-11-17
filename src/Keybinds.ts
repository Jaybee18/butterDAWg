import { play } from "./Audio";
import { globals } from "./globals";

// add key event listeners
document.addEventListener("keypress", (e) => {
	if (e.code === "Space" && !globals.deactivate_space_to_play) {
		e.preventDefault();
		play();
	}
});
document.addEventListener("keydown", (e) => {
	globals.control_down = e.ctrlKey;
	globals.alt_down = e.altKey;
});
document.addEventListener("keyup", (e) => {
	globals.control_down = e.ctrlKey;
	globals.alt_down = e.altKey;
});
