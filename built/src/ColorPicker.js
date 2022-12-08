"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color_picker = void 0;
var Color_1 = require("./Color");
// new color picker
exports.color_picker = document.getElementById("color_picker");
var color_picker_buttons = document.querySelectorAll(".color_picker > #bottom > .btn");
var color_picker_reset = color_picker_buttons[0];
var color_picker_confirm = color_picker_buttons[1];
var color_picker_drag_handle = document.querySelector(".color_picker > #top");
var color_picker_canvas = document.querySelector(".color_picker canvas");
var color_picker_cursor = document.getElementById("canvas_cursor");
var color_picker_preview = document.getElementById("color_picker_preview");
var color_picker_preview_code = document.querySelector("#color_picker_preview p");
var luminance_slider = document.getElementById("luminance_slider");
var luminance_cursor = document.getElementById("luminance_cursor");
var sliders = document.querySelectorAll(".color_slider > p");
var ctx = color_picker_canvas.getContext("2d");
var color_picker_width = 255;
var color_picker_height = 255;
var luminance = 125;
var color_picker_cursor_pos = { "x": 0, "y": 0 };
var current_color = { "r": 255, "g": 0, "b": 0, "a": 255 };
var canvasData = ctx.getImageData(0, 0, color_picker_width, color_picker_height);
/** https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
// https://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas
// That's how you define the value of a pixel
function drawPixel(x, y, r, g, b, a) {
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
for (var i = 0; i < color_picker_width; i++) {
    for (var j = 0; j < color_picker_height; j++) {
        var h = i / color_picker_width;
        var s = 1 - (j * (200 / 240) / color_picker_height);
        var l = 120 / 240;
        var _a = hslToRgb(h, s, l), r = _a[0], g = _a[1], b = _a[2];
        drawPixel(i, j, r, g, b, 255);
    }
}
updateCanvas();
function updateColorPickerPreview() {
    var h = color_picker_cursor_pos.x / color_picker_width;
    var s = 1 - (color_picker_cursor_pos.y / color_picker_height);
    var l = 1 - (luminance / 255);
    var _a = hslToRgb(h, s, l), r = _a[0], g = _a[1], b = _a[2];
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
    color_picker_preview_code.innerText = new Color_1.Color("").fromRGB(r, g, b).color;
}
updateColorPickerPreview();
color_picker_confirm.addEventListener("click", function () {
    console.log("is this even called?");
    //current_context_track.setColor(new Color(current_color.r, current_color.g, current_color.b));
    exports.color_picker.style.display = "none";
});
var canvas_min = 75;
document.getElementById("upper_canvas_limiter").style.height = canvas_min + "px";
var canvas_max = 30;
document.getElementById("lower_canvas_limiter").style.height = canvas_max + "px";
function color_picker_cursor_movement(e) {
    color_picker_cursor_pos.x = Math.min(Math.max(0, e.clientX - exports.color_picker.offsetLeft - 26), 250);
    color_picker_cursor_pos.y = Math.min(Math.max(0 + (colors_limited ? canvas_min : 0), e.clientY - exports.color_picker.offsetTop - 80), 250 - (colors_limited ? canvas_max : 0));
    color_picker_cursor.style.left = color_picker_cursor_pos.x + 26 + "px";
    color_picker_cursor.style.top = color_picker_cursor_pos.y + 76 + "px";
    updateColorPickerPreview();
}
color_picker_canvas.addEventListener("mousedown", function () {
    document.addEventListener("mousemove", color_picker_cursor_movement);
});
document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", color_picker_cursor_movement);
});
var lum_min = 75;
document.getElementById("upper_luminance_limiter").style.height = lum_min + "px";
var lum_max = 90;
document.getElementById("lower_luminance_limiter").style.height = lum_max + "px";
function color_picker_luminance_movement(e) {
    luminance = Math.max(Math.min(e.clientY - exports.color_picker.offsetTop - 80, 250 - (colors_limited ? lum_max : 0)), 0 + (colors_limited ? lum_min : 0));
    luminance_cursor.style.top = luminance + 79 - 6 + "px";
    updateColorPickerPreview();
}
luminance_slider.addEventListener("mousedown", function () {
    document.addEventListener("mousemove", color_picker_luminance_movement);
});
document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", color_picker_luminance_movement);
});
var color_picker_offset = { "x": 0, "y": 0 };
function color_picker_movement(e) {
    exports.color_picker.style.left = e.clientX - color_picker_offset.x + "px";
    exports.color_picker.style.top = e.clientY - color_picker_offset.y + "px";
}
color_picker_drag_handle.addEventListener("mousedown", function (e) {
    color_picker_offset.x = e.clientX - exports.color_picker.offsetLeft;
    color_picker_offset.y = e.clientY - exports.color_picker.offsetTop;
    document.addEventListener("mousemove", color_picker_movement);
});
document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", color_picker_movement);
});
var color_picker_close_button = document.querySelector(".color_picker #conf_xmark");
color_picker_close_button.addEventListener("mousedown", function () {
    exports.color_picker.style.display = "none";
});
var luminance_upper = document.getElementById("upper_luminance_limiter");
var luminance_lower = document.getElementById("lower_luminance_limiter");
var canvas_upper = document.getElementById("upper_canvas_limiter");
var canvas_lower = document.getElementById("lower_canvas_limiter");
var colors_limited = true;
function color_limitations() {
    colors_limited = !colors_limited;
    luminance_upper.style.display = colors_limited ? "block" : "none";
    luminance_lower.style.display = colors_limited ? "block" : "none";
    canvas_upper.style.display = colors_limited ? "block" : "none";
    canvas_lower.style.display = colors_limited ? "block" : "none";
    var temp = { "clientY": luminance + exports.color_picker.offsetTop + 80, "clientX": color_picker_cursor_pos.x + exports.color_picker.offsetLeft + 26 };
    color_picker_luminance_movement(temp);
    temp.clientY = color_picker_cursor_pos.y + exports.color_picker.offsetTop + 80;
    color_picker_cursor_movement(temp);
}
