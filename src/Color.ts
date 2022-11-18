export class Color {

	color: string;

	constructor(hex: string, g?: string, b?: string) {
		if (g === undefined && b === undefined) {
			this.color = <string>hex;
		} else {
			this.color = "#" + hex.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
		}
	}
	fromRGB(r: number, g: number, b: number) { // obsolete
		return new Color(r.toString(16), g.toString(16), b.toString(16));
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
		return this.color + magnitude.toString(16);
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
