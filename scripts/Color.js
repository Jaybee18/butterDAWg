class Color {
    constructor (hex, g, b) {
      if (g === undefined && b === undefined) {
        this.color = hex;
      } else {
        this.color = "#" + hex.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
      }
    }
    fromRGB(r, g, b) { // obsolete
      return new Color(r.toString(16), g.toString(16), b.toString(16));
    }
    toRGB() {
      var r = Number.parseInt(this.color.substring(1, 3), 16);
      var g = Number.parseInt(this.color.substring(3, 5), 16);
      var b = Number.parseInt(this.color.substring(5, 7), 16);
      return [r, g, b];
    }
    toRGBString() {
      var values = this.toRGB();
      return "rgb(" + values[0] + "," + values[1] + "," + values[2] + ")";
    }
    darken(magnitude) {
      // magnitude = value from 0 to 255
      var values = this.toRGB();
      var a = values.map((v) => {return Math.max(v - magnitude, 0).toString(16).padStart(2, "0");});
      return "#" + a[0] + a[1] + a[2];
    }
    lighten(magnitude) {
      // magnitude = value from 0 to 255
      var values = this.toRGB();
      var a = values.map((v) => {return Math.min(v + magnitude, 255).toString(16).padStart(2, "0");});
      return "#" + a[0] + a[1] + a[2];
    }
    transparent(magnitude) {
      return this.color + magnitude.toString(16);
    }
  }
  