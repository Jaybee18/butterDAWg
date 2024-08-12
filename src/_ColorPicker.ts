import { Color, hslToRgb } from "./ui/misc/Color";
import { globals } from "./globals";

// new color picker
//export var color_picker = document.getElementById("color_picker");
let color_picker_buttons = document.querySelectorAll(".color_picker > #bottom > .btn");
let color_picker_reset = color_picker_buttons[0];
let color_picker_confirm = color_picker_buttons[1];
let color_picker_drag_handle = <HTMLElement> document.querySelector(".color_picker > #top");
var color_picker_canvas = <HTMLCanvasElement>document.querySelector(".color_picker canvas");
var color_picker_cursor = document.getElementById("canvas_cursor");
var color_picker_preview = document.getElementById("color_picker_preview");
let color_picker_preview_code = <HTMLElement>document.querySelector("#color_picker_preview p");
var luminance_slider = document.getElementById("luminance_slider");
var luminance_cursor = document.getElementById("luminance_cursor");
let sliders = <NodeListOf<HTMLElement>>document.querySelectorAll(".color_slider > p");
var ctx = color_picker_canvas.getContext("2d");
var color_picker_width = 255;
var color_picker_height = 255;
var luminance = 125;
var color_picker_cursor_pos = { "x": 0, "y": 0 };
var current_color = { "r": 255, "g": 0, "b": 0, "a": 255 };
var canvasData = ctx.getImageData(0, 0, color_picker_width, color_picker_height);

// https://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas
// That's how you define the value of a pixel
function drawPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
	var index = (x + y * color_picker_width) * 4;

	canvasData.data[index + 0] = r;
	canvasData.data[index + 1] = g;
	canvasData.data[index + 2] = b;
	canvasData.data[index + 3] = a;
}

// That's how you update the canvas, so that your
// modification are taken in consideration
function updateCanvas() {
	ctx.putImageData(canvasData, 0, 0);
}
for (let i = 0; i < color_picker_width; i++) {
	for (let j = 0; j < color_picker_height; j++) {
		let h = i / color_picker_width;
		let s = 1 - (j * (200 / 240) / color_picker_height);
		let l = 120 / 240;
		let [r, g, b] = hslToRgb(h, s, l);
		drawPixel(i, j, r, g, b, 255);
	}
}
updateCanvas();

function updateColorPickerPreview() {
	let h = color_picker_cursor_pos.x / color_picker_width;
	let s = 1 - (color_picker_cursor_pos.y / color_picker_height);
	let l = 1 - (luminance / 255);
	let [r, g, b] = hslToRgb(h, s, l);
	current_color.r = r;
	current_color.g = g;
	current_color.b = b;
	color_picker_preview.style.background = "rgb(" + r + "," + g + "," + b + ")";

	var index = (color_picker_cursor_pos.x + color_picker_cursor_pos.y * color_picker_width) * 4;
	luminance_slider.style.backgroundColor = "rgba(" + canvasData.data[index + 0] + "," + canvasData.data[index + 1] + "," + canvasData.data[index + 2] + "," + canvasData.data[index + 3] + ")";

	// update the color values below
	// idfk why these are such weird integer values
	sliders[0].innerText = Math.round(h * 358).toString();
	sliders[1].innerText = Math.round(s * 239).toString();
	sliders[2].innerText = Math.round(l * 240).toString();
	sliders[3].innerText = Math.round(r).toString();
	sliders[4].innerText = Math.round(g).toString();
	sliders[5].innerText = Math.round(b).toString();

	color_picker_preview_code.innerText = new Color("").fromRGB(r, g, b).color;
}
updateColorPickerPreview();

color_picker_confirm.addEventListener("click", () => {
	globals.current_context_track.setColor(new Color(current_color.r, current_color.g, current_color.b));
	color_picker.style.display = "none";
});

let canvas_min = 75;
document.getElementById("upper_canvas_limiter").style.height = canvas_min + "px";
let canvas_max = 30;
document.getElementById("lower_canvas_limiter").style.height = canvas_max + "px";
function color_picker_cursor_movement(e: { clientX: number, clientY: number}) {
	color_picker_cursor_pos.x = Math.min(Math.max(0, e.clientX - color_picker.offsetLeft - 26), 250);
	color_picker_cursor_pos.y = Math.min(Math.max(0 + (colors_limited ? canvas_min : 0), e.clientY - color_picker.offsetTop - 80), 250 - (colors_limited ? canvas_max : 0));
	color_picker_cursor.style.left = color_picker_cursor_pos.x + 26 + "px";
	color_picker_cursor.style.top = color_picker_cursor_pos.y + 76 + "px";

	updateColorPickerPreview()
}
color_picker_canvas.addEventListener("mousedown", () => {
	document.addEventListener("mousemove", color_picker_cursor_movement);
});
document.addEventListener("mouseup", () => {
	document.removeEventListener("mousemove", color_picker_cursor_movement);
});

let lum_min = 75;
document.getElementById("upper_luminance_limiter").style.height = lum_min + "px";
let lum_max = 90;
document.getElementById("lower_luminance_limiter").style.height = lum_max + "px";
function color_picker_luminance_movement(e: { clientX: number, clientY: number}) {
	luminance = Math.max(Math.min(e.clientY - color_picker.offsetTop - 80, 250 - (colors_limited ? lum_max : 0)), 0 + (colors_limited ? lum_min : 0));
	luminance_cursor.style.top = luminance + 79 - 6 + "px";
	updateColorPickerPreview()
}
luminance_slider.addEventListener("mousedown", () => {
	document.addEventListener("mousemove", color_picker_luminance_movement);
});
document.addEventListener("mouseup", () => {
	document.removeEventListener("mousemove", color_picker_luminance_movement);
});

let color_picker_offset = { "x": 0, "y": 0 };
function color_picker_movement(e: MouseEvent) {
	color_picker.style.left = e.clientX - color_picker_offset.x + "px";
	color_picker.style.top = e.clientY - color_picker_offset.y + "px";
}
color_picker_drag_handle.addEventListener("mousedown", (e: MouseEvent) => {
	color_picker_offset.x = e.clientX - color_picker.offsetLeft;
	color_picker_offset.y = e.clientY - color_picker.offsetTop;
	document.addEventListener("mousemove", color_picker_movement);
});
document.addEventListener("mouseup", () => {
	document.removeEventListener("mousemove", color_picker_movement);
});

let color_picker_close_button = document.querySelector(".color_picker #conf_xmark");
color_picker_close_button.addEventListener("mousedown", () => {
	color_picker.style.display = "none";
});

let luminance_upper = document.getElementById("upper_luminance_limiter");
let luminance_lower = document.getElementById("lower_luminance_limiter");
let canvas_upper = document.getElementById("upper_canvas_limiter");
let canvas_lower = document.getElementById("lower_canvas_limiter");
var colors_limited = true;
export function color_limitations() {
	colors_limited = !colors_limited;
	luminance_upper.style.display = colors_limited ? "block" : "none";
	luminance_lower.style.display = colors_limited ? "block" : "none";
	canvas_upper.style.display = colors_limited ? "block" : "none";
	canvas_lower.style.display = colors_limited ? "block" : "none";
	let temp = { "clientY": luminance + color_picker.offsetTop + 80, "clientX": color_picker_cursor_pos.x + color_picker.offsetLeft + 26 };
	color_picker_luminance_movement(temp);
	temp.clientY = color_picker_cursor_pos.y + color_picker.offsetTop + 80;
	color_picker_cursor_movement(temp);
}
