import { existsSync, readdirSync, lstatSync } from "fs";
import { globals } from "../globals";
import { Item } from "../PaletteItem";

// palette functionality

export function loadPalette() {
	// event listener for dragging
	var drag_container = document.getElementById("drag_container");
	document.addEventListener("mousemove", (e) => {
		if (globals.current_drag_element === null) { return; }
		if (!drag_container.hasChildNodes()) {
			var clone = (<Item>globals.current_drag_element).getDragElement().cloneNode(true);
			drag_container.appendChild(clone);
			drag_container.style.display = "block";
		}
		drag_container.style.left = (e.clientX - drag_container.clientWidth / 2) + "px";
		drag_container.style.top = e.clientY + "px";

		// angle container for visual appeal
		drag_container.style.transform = "rotateZ(" + e.movementX + "deg)";
	});

	function mapFolder(folder: string) {
		if (!existsSync(folder)) {
			console.log("couldn't read palette input folder");
			return new Map([["", ""]]);
		}
		// if 'folder' is a file, only return the file
		// aka arrived at the deepest possible recursion in the folder
		if (lstatSync(folder).isFile()) {
			if (folder[0] === ".") {
				return null; // has to be null !
			}
			return folder;
		}
		// 'folder' is a folder, recursively map the remaining contents
		let res: Map<string, string> = new Map();
		var filenames = readdirSync(folder);
		filenames.forEach(file => {
			let content = mapFolder(folder + "/" + file);
			if (content !== null) {
				res.set(file, <string>content);
			}
		});
		return res;
	}
	let hirachy = <Map<string, string>>mapFolder(__dirname + "/../../../files");

	hirachy.forEach((element, key) => {
		var a = new Item(key, element);
		a.appendToSidebar();
	});
}
