import { existsSync, readdirSync, lstatSync } from "fs";
import { Draggable, globals } from "./globals";
import { Item } from "./PaletteItem";

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
	let hirachy = <Map<string, string>>mapFolder(__dirname + "/../../files");

	hirachy.forEach((element, key) => {
		var a = new Item(key, element);
		a.appendToSidebar();
	});
}

// TODO THIS SHOULD ONLY BE A VERY VERY TEMPORARY FIX
/*export function setupPalette() {
	console.log("no?")
	// TODO event listeners setup may be a bit inefficient
	var palette = document.querySelector(".palette");
	var palette_current_scope = 0;
	var palette_current_element = null; /* current selected object to paint on tracks 
	var palette_content: Draggable[][] = [[], [], []]; // list of lists of 'Item's
	var scopes = <NodeListOf<HTMLElement>>document.querySelectorAll(".palette_scope > .tool_button");
	console.log(scopes);
	for (let j = 0; j < 3; j++) {
		scopes[j].style.fill = "#8f979b";
	}
	scopes[0].style.fill = "#d2d8dc";
	for (let i = 0; i < scopes.length; i++) {
		scopes[i].addEventListener("click", () => {
			palette_current_scope = i;
			var content = "";
			palette_content[i].forEach(item => {
				content += '<div class="palette_object">\
                    <i class="fa-solid fa-wave-square"></i>\
                    <p>' + (<Item>item).title.split(".")[0] + '</p>\
                  </div>';
			});
			palette.innerHTML = content;
			for (let j = 0; j < palette.childElementCount; j++) {
				palette.children[j].addEventListener("click", () => {
					for (let k = 0; k < palette.childElementCount; k++) {
						(<HTMLElement>palette.children[k]).style.boxShadow = "";
					}
					(<HTMLElement>palette.children[j]).style.boxShadow = "inset 0 0 0 1px #a8e44a";
					palette_current_element = palette_content[i][j];
				});
			}
			for (let j = 0; j < 3; j++) {
				scopes[j].style.fill = "#8f979b";
			}
			scopes[i].style.fill = "#d2d8dc";
		});
	}
	palette.addEventListener("mouseenter", () => {
		// sample preview
		if (globals.current_drag_element !== null) {
			globals.current_drag_element
			palette.insertAdjacentHTML("beforeend", '<div class="palette_object" style="opacity: 0.3;">\
                                              <i class="fa-solid fa-wave-square"></i>\
                                              <p>' + (<Item>globals.current_drag_element).title.split(".")[0] + '</p>\
                                            </div>');
			drag_container.style.display = "none";
		}
	});
	palette.addEventListener("mouseleave", () => {
		if (globals.current_drag_element !== null) {
			palette.lastChild.remove();
			drag_container.style.display = "block";
		}
	});
	palette.addEventListener("mouseup", () => {
		if (globals.current_drag_element !== null) {
			var newChild = <HTMLElement>palette.lastElementChild;
			newChild.style.opacity = "1";
			palette_content[palette_current_scope].push(globals.current_drag_element);
			var index = palette_content[palette_current_scope].length - 1;
			newChild.addEventListener("click", () => {
				for (let i = 0; i < palette.childElementCount; i++) {
					(<HTMLElement>palette.children[i]).style.boxShadow = "";
				}
				newChild.style.boxShadow = "inset 0 0 0 1px #a8e44a";
				palette_current_element = palette_content[palette_current_scope][index];
			});
		}
	});

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

	// add sidebar tree functionality
	// make a class for sidebar_items that holds which indent level they have
	// fill the sidebartree data
	console.log("do that")
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
	let hirachy = <Map<string, string>>mapFolder(__dirname + "/../../files");

	hirachy.forEach((element, key) => {
		var a = new Item(key, element);
		a.appendToSidebar();
	});

}*/