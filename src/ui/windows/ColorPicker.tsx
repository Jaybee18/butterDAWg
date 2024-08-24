import { Window } from "../misc/window";
import { addDragListener, cumulativeOffset, React } from "../../globals";
import { Color, hslToRgb } from "../misc/Color";

/*function color_limitations() {
	colors_limited = !colors_limited;
	luminance_upper.style.display = colors_limited ? "block" : "none";
	luminance_lower.style.display = colors_limited ? "block" : "none";
	canvas_upper.style.display = colors_limited ? "block" : "none";
	canvas_lower.style.display = colors_limited ? "block" : "none";
	let temp = { "clientY": luminance + color_picker.offsetTop + 80, "clientX": color_picker_cursor_pos.x + color_picker.offsetLeft + 26 };
	color_picker_luminance_movement(temp);
	temp.clientY = color_picker_cursor_pos.y + color_picker.offsetTop + 80;
	color_picker_cursor_movement(temp);
}*/

function coordsToIndex(x: number, y: number, width: number) {
	return x + y * width;
}

function drawPixel(canvasData: ImageData, index: number, r: number, g: number, b: number, a: number) {
	var actual_index = index * 4;

	canvasData.data[actual_index + 0] = r;
	canvasData.data[actual_index + 1] = g;
	canvasData.data[actual_index + 2] = b;
	canvasData.data[actual_index + 3] = a;
}

export class ColorPicker extends Window {

	private color: Color = new Color(0, 0, 0);
	private onApply: Function;

	constructor(color: Color, onApply: Function) {
		super(false);

		this.color = color;
		this.onApply = onApply;
		this.setResizable(false);

		this.initialiseContent();
	}

	initialiseContent(): void {
		this.setContentWithReact(<div className="color_picker" id="color_picker">
			{/*<div id="top">
				<p>Color Selector</p>
				<div className="tool_button" id="conf_xmark">
					<i className="fa-solid fa-xmark"></i>
				</div>
			</div>*/}
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
						<canvas width="255" height="255"></canvas>
						<div id="upper_canvas_limiter"></div>
						<div id="lower_canvas_limiter"></div>
						<div id="canvas_cursor"></div>
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

		const canvas_min = 75;
		const canvas_max = 30;
		const lum_min = 75;
		const lum_max = 90;
		let luminance = 125;
		let current_color = { "r": 255, "g": 0, "b": 0, "a": 255 };
		const color_picker_width = 255;
		const color_picker_height = 255;
		let colors_limited = true;
		const color_picker_cursor_pos = { "x": 0, "y": 0 };

		let color_picker_canvas = this.get(".color_picker canvas") as HTMLCanvasElement;
		let ctx = color_picker_canvas.getContext("2d");
		let canvasData = ctx.getImageData(0, 0, color_picker_width, color_picker_height);
		const updateCanvas = () => { ctx.putImageData(canvasData, 0, 0) }
		// draw color space
		for (let i = 0; i < color_picker_width; i++) {
			for (let j = 0; j < color_picker_height; j++) {
				let h = i / color_picker_width;
				let s = 1 - (j * (200 / 240) / color_picker_height);
				let l = 120 / 240;
				let [r, g, b] = hslToRgb(h, s, l);
				drawPixel(canvasData, coordsToIndex(i, j, color_picker_width), r, g, b, 255);
			}
		}
		updateCanvas();

		// color picker preview
		let color_picker_preview = this.get("#color_picker_preview");
		let luminance_slider = this.get("#luminance_slider");
		let sliders = this.element.querySelectorAll(".color_slider > p") as NodeListOf<HTMLElement>;
		let color_picker_preview_code = this.get("#color_picker_preview p");
		const update_color_picker_preview = () => {
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

			color_picker_preview_code.innerText = new Color(r, g, b).color;

			this.color.set(r, g, b);
		}

		// drag listener for color picker canvas
		let color_picker_cursor = this.get("#canvas_cursor");
		const color_picker_cursor_movement = (e: MouseEvent) => {
			color_picker_cursor_pos.x = Math.min(Math.max(0, e.clientX - cumulativeOffset(color_picker_canvas).left), 255);
			color_picker_cursor_pos.y = Math.min(Math.max(0 + (colors_limited ? canvas_min : 0), e.clientY - cumulativeOffset(color_picker_canvas).top), 255 - (colors_limited ? canvas_max : 0));
			color_picker_cursor.style.left = color_picker_cursor_pos.x + "px";
			color_picker_cursor.style.top = color_picker_cursor_pos.y + "px";

			update_color_picker_preview();
		};
		addDragListener(color_picker_canvas, color_picker_cursor_movement, true);

		// drag listener for luminance picker
		let luminance_cursor = this.get("#luminance_cursor");
		const luminance_picker_cursor_movement = (e: MouseEvent) => {
			luminance = Math.min(Math.max(0, e.clientY - cumulativeOffset(luminance_slider).top), luminance_slider.clientHeight);
			luminance_cursor.style.top = luminance - luminance_cursor.clientHeight/2 + "px";
			update_color_picker_preview();
		}
		addDragListener(luminance_slider, luminance_picker_cursor_movement, true);

		// toggle color limitations
		const upper_canvas_limiter = this.get("#upper_canvas_limiter");
		const lower_canvas_limiter = this.get("#lower_canvas_limiter");
		const upper_luminance_limiter = this.get("#upper_luminance_limiter");
		const lower_luminance_limiter = this.get("#lower_luminance_limiter");
		const toggle_limits = () => {
			colors_limited = !colors_limited;
			upper_canvas_limiter.style.display = colors_limited ? "block" : "none";
			lower_canvas_limiter.style.display = colors_limited ? "block" : "none";
			upper_luminance_limiter.style.display = colors_limited ? "block" : "none";
			lower_luminance_limiter.style.display = colors_limited ? "block" : "none";
		};
		toggle_limits();

		// buttons
		let cancel_button = this.get("#bottom > .btn:nth-child(1)");
		let confirm_button = this.get("#bottom > .btn:nth-child(2)");
		confirm_button.addEventListener("click", () => {
			this.onApply(this.color);
			this.close();
		});
		cancel_button.addEventListener("click", () => {
			this.close();
		});

		update_color_picker_preview();
	}
}