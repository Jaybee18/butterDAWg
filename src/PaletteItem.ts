import { WaveFile } from "wavefile";
import { globals, Draggable, sidebar_folder_colors, insertAfter } from "./globals";
import { readFileSync } from "fs";

export class Item extends Draggable {

	file: WaveFile;
	depth_type: Float32ArrayConstructor; // TODO needed?
	contents: string | Map<string, string>;
	active: boolean;
	indent: number;
	children: Array<Item>;
	title: string;
	depth: string;
	depth_max: number;

	constructor(title: string, contents: string | Map<string, string>, indent = 0) {
		super();
		this.file = null;
		this.contents = contents;
		this.active = false;
		this.indent = indent;
		this.children = [];
		this.title = title;
		this.depth = "32f";
		this.depth_type = Float32Array;
		this.depth_max = 1.0;

		// construct container
		var a = document.createElement("div");
		a.classList.add("sidebar_item_lvl1");
		var dedicated_color = sidebar_folder_colors[title];
		a.style.color = dedicated_color === undefined ? "var(--bg-light)" : dedicated_color;
		a.style.marginLeft = indent * globals.palette_indent_width + "px";
		this.element = a;
		// add icon
		var ending = title.split(".").pop();
		if (ending === "wav") {
			var type_icon = document.createElement("i");
			type_icon.classList.add("fa-solid");
			type_icon.classList.add("fa-file-audio");
			this.loadData();
			this.initializeDragListener();
		} else if (title === ending) {
			var type_icon = document.createElement("i");
			type_icon.classList.add("fa-regular");
			type_icon.classList.add("fa-folder");
		} else {
			var type_icon = document.createElement("i");
			type_icon.classList.add("fa-solid");
			type_icon.classList.add("fa-file");
		}
		a.appendChild(type_icon);
		// add text object
		var b = document.createElement("div");
		b.classList.add("sidebar_item_lvl1_text");
		b.innerHTML = title;
		a.appendChild(b);

		this.initializeEventListeners();
	}

	loadData() {
		// Load a wav file buffer as a WaveFile object
		this.file = new WaveFile(readFileSync(<string> this.contents));
		if (this.file.bitDepth !== "32f") {
			this.file.toBitDepth("32f");
		}
		this.depth = this.file.bitDepth;
	}

	getData() {
		return this.file.getSamples(true);
	}

	getWidth() {
		// returns the sample size in frames as an integer
		return this.file.chunkSize;
	}

	getDuration() {
		// returns duration in seconds
		return this.getData().length / globals.sample_rate / 2;
	}

	initializeEventListeners() {
		this.element.addEventListener("click", () => {
			if (this.contents === undefined) { return; }
			if (this.active) {
				this.active = false;
				this.close();
			} else {
				this.active = true;
				this.open();
			}
		});
	}

	getDragElement() {
		return this.element.children[1];
	}

	close() {
		if (this.contents === undefined) {
			this.element.remove();
			return;
		}
		this.children.forEach(item => {
			item.close();
			item.remove();
		});
		this.children = [];
	}

	open() {
		// if this item is a folder, open it
		if (this.contents === undefined) { return; }
		(<Map<string, string>> this.contents).forEach((element, key) => {
			var a = new Item(key, element, this.indent + 1);
			a.appendAfter(this.element);
			this.children.push(a);
		});
	}

	remove() {
		this.element.remove();
	}

	appendToSidebar() {
		globals.sidebar.appendChild(this.element);
	}

	appendAfter(element: HTMLElement) {
		this.element.style.color = element.style.color;
		insertAfter(this.element, element);
	}
}
