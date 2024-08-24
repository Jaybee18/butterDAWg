import { Window } from "../../window";
import { cumulativeOffset, globals, React } from "../../globals";
import { Color } from "../misc/Color";

export class ColorPicker extends Window {

    private canvas: HTMLCanvasElement;
    private color_picker_cursor_pos: { x: number, y: number };
    private color: Color;
    private luminance: number;
    private onChosen: Function;

    constructor(options?: {
        onChosen: Function;
    }) {
        super();

        this.color_picker_cursor_pos = { x: 0, y: 0 };
        this.color = new Color(0, 0, 0);
        this.luminance = 125;
        this.onChosen = options === undefined ? () => { } : options.onChosen;
    }

    initialiseContent(): void {
        this.setContent(<div className="color_picker" id="color_picker">
            <div id="color_picker_inner">
                <div id="color_picker_top">
                    <div className="color_picker_button"></div>
                    <div className="color_picker_button"></div>
                    <div className="color_picker_button"></div>
                    <div className="color_picker_button"></div>
                    <div className="color_picker_button">
                        <div className="tool_button" id="lock"><i className="fa-solid fa-lock"></i></div>
                    </div>
                </div>
                <div id="color_picker_mid">
                    <div>
                        <div>
                            <canvas width="255" height="255"></canvas>
                            <div id="canvas_cursor"></div>
                        </div>
                        <div id="upper_canvas_limiter"></div>
                        <div id="lower_canvas_limiter"></div>
                    </div>
                    <div id="luminance_slider">
                        <div id="luminance_cursor"></div>
                        <div id="upper_luminance_limiter"></div>
                        <div id="lower_luminance_limiter"></div>
                    </div>
                </div>
                <div id="values">
                    <div id="color_picker_preview">
                        <p>#000000</p>
                    </div>
                    <div>
                        <div className="color_slider_wrapper">
                            <p>Hue</p>
                            <div className="color_slider">
                                <p>255</p>
                            </div>
                        </div>
                        <div className="color_slider_wrapper">
                            <p>Saturation</p>
                            <div className="color_slider">
                                <p>255</p>
                            </div>
                        </div>
                        <div className="color_slider_wrapper">
                            <p>Luminance</p>
                            <div className="color_slider">
                                <p>255</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="color_slider_wrapper">
                            <p>Red</p>
                            <div className="color_slider">
                                <p>255</p>
                            </div>
                        </div>
                        <div className="color_slider_wrapper">
                            <p>Green</p>
                            <div className="color_slider">
                                <p>255</p>
                            </div>
                        </div>
                        <div className="color_slider_wrapper">
                            <p>Blue</p>
                            <div className="color_slider">
                                <p>255</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="bottom">
                <div className="btn">
                    Reset
                </div>
                <div className="btn">
                    Apply
                </div>
            </div>
        </div> as any);

        this.canvas = this.get("canvas") as HTMLCanvasElement;

        let colors_limited = true;

        // canvas movement
        let color_picker_cursor = this.get("#canvas_cursor");
        let canvas_min = 75;
        this.get("#upper_canvas_limiter").style.height = canvas_min + "px";
        let canvas_max = 30;
        this.get("#lower_canvas_limiter").style.height = canvas_max + "px";
        const color_picker_cursor_movement = (e: MouseEvent) => {
            let canvas_pos = cumulativeOffset(this.canvas);
            let delta = {x: e.clientX - canvas_pos.left, y: e.clientY - canvas_pos.top};
            this.color_picker_cursor_pos.x = Math.min(Math.max(0, delta.x), 250);
            this.color_picker_cursor_pos.y = Math.min(Math.max(0 + (colors_limited ? canvas_min : 0), delta.y), 250 - (colors_limited ? canvas_max : 0));
            color_picker_cursor.style.left = this.color_picker_cursor_pos.x - 3 + "px";
            color_picker_cursor.style.top = this.color_picker_cursor_pos.y - color_picker_cursor.clientHeight/2 - 1 + "px";

            this.updateColorPickerPreview();
        }
        this.canvas.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", color_picker_cursor_movement);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", color_picker_cursor_movement);
        });

        // luminance slider
        let luminance_slider = this.get("#luminance_slider");
        let luminance_cursor = this.get("#luminance_cursor");
        let lum_min = 75;
        this.get("#upper_luminance_limiter").style.height = lum_min + "px";
        let lum_max = 90;
        this.get("#lower_luminance_limiter").style.height = lum_max + "px";
        const color_picker_luminance_movement = (e: MouseEvent) => {
            this.luminance = Math.max(Math.min(e.clientY - this.element.offsetTop - 57, 250 - (colors_limited ? lum_max : 0)), 0 + (colors_limited ? lum_min : 0));
            luminance_cursor.style.top = this.luminance - luminance_cursor.clientHeight/2 + "px";
            this.updateColorPickerPreview()
        }
        luminance_slider.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", color_picker_luminance_movement);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", color_picker_luminance_movement);
        });

        // confirm button
        let color_picker_buttons = this.element.querySelectorAll(".color_picker > #bottom > .btn");
        let confirm_button = color_picker_buttons[1];
        confirm_button.addEventListener("click", () => {
            this.onChosen();
        });

        this.updateCanvas();

        this.setContentSize(355, 550);
    }

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
    private hslToRgb(h: number, s: number, l: number): [number, number, number] {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p: number, q: number, t: number) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

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
    private drawPixel(canvasData: ImageData, x: number, y: number, r: number, g: number, b: number, a: number) {
        var index = (x + y * 255) * 4;

        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    }

    private updateCanvas() {
        let ctx = this.canvas.getContext("2d");
        let imageData = ctx.getImageData(0, 0, 255, 255);
        for (let i = 0; i < 255; i++) {
            for (let j = 0; j < 255; j++) {
                let h = i / 255;
                let s = 1 - (j * (200 / 240) / 255);
                let l = 120 / 240;
                let [r, g, b] = this.hslToRgb(h, s, l);
                this.drawPixel(imageData, i, j, r, g, b, 255);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    private updateColorPickerPreview() {
        let canvasData = this.canvas.getContext("2d").getImageData(0, 0, 255, 255);
        let color_picker_preview = this.get("#color_picker_preview");
        let sliders = this.element.querySelectorAll(".color_slider > p") as any;
        let luminance_slider = this.get("#luminance_slider");

        let h = this.color_picker_cursor_pos.x / 255;
        let s = 1 - (this.color_picker_cursor_pos.y / 255);
        let l = 1 - (this.luminance / 255);
        let [r, g, b] = this.hslToRgb(h, s, l);
        this.color.fromRGB(r, g, b);
        color_picker_preview.style.background = "rgb(" + r + "," + g + "," + b + ")";

        var index = (this.color_picker_cursor_pos.x + this.color_picker_cursor_pos.y * 255) * 4;
        luminance_slider.style.backgroundColor = "rgba(" + canvasData.data[index + 0] + "," + canvasData.data[index + 1] + "," + canvasData.data[index + 2] + "," + canvasData.data[index + 3] + ")";

        // update the color values below
        // idfk why these are such weird integer values
        sliders[0].innerText = Math.round(h * 358).toString();
        sliders[1].innerText = Math.round(s * 239).toString();
        sliders[2].innerText = Math.round(l * 240).toString();
        sliders[3].innerText = Math.round(r).toString();
        sliders[4].innerText = Math.round(g).toString();
        sliders[5].innerText = Math.round(b).toString();

        let color_picker_preview_code = this.get("#color_picker_preview p");
        color_picker_preview_code.innerText = new Color("").fromRGB(r, g, b).color;
    }
}