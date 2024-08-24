export class Color {

	color: string;

	constructor(hex: string | number, g?: number, b?: number) {
		if (g === undefined && b === undefined) {
			this.color = <string>hex;
		} else {
			this.color = "#" + hex.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
		}
	}
	fromRGB(r: number, g: number, b: number) { // obsolete
		console.error("obsolete!");
		return new Color(r.toString(16), Number.parseInt(g.toString(16)), Number.parseInt(b.toString(16)));
	}
	set(r: number, g: number, b: number) {
		this.color = "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
	}
	toRGB() {
		var r = Number.parseInt(this.color.substring(1, 3), 16);
		var g = Number.parseInt(this.color.substring(3, 5), 16);
		var b = Number.parseInt(this.color.substring(5, 7), 16);
		return [r, g, b];
	}
	toRGBString(r: string | number, g: string | number, b: string | number) {
		let values = undefined;
		if (r === undefined || g === undefined || b === undefined) {
			values = this.toRGB();
		} else {
			values = [r, g, b];
		}
		return "rgb(" + values[0] + "," + values[1] + "," + values[2] + ")";
	}
	darken(magnitude: number) {
		// magnitude = value from 0 to 255
		var values = this.toRGB();
		var a = values.map((v) => { return Math.max(v - magnitude, 0).toString(16).padStart(2, "0"); });
		return "#" + a[0] + a[1] + a[2];
	}
	lighten(magnitude: number) {
		// magnitude = value from 0 to 255
		var values = this.toRGB();
		var a = values.map((v) => { return Math.min(v + magnitude, 255).toString(16).padStart(2, "0"); });
		return "#" + a[0] + a[1] + a[2];
	}
	transparent(magnitude: number) {
		// magnitude = value from 0 to 255
		return this.color + magnitude.toString(16).padStart(2, "0");
	}
	lerp(target_color: Color, percent: number) {
		let [r, g, b] = this.toRGB();
		let [tr, tg, tb] = target_color.toRGB();
		r += (tr - r) * percent;
		g += (tg - g) * percent;
		b += (tb - b) * percent;
		return this.toRGBString(r, g, b);
	}
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
 export function hslToRgb(h: number, s: number, l: number) {
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