"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = void 0;
var Color = /** @class */ (function () {
    function Color(hex, g, b) {
        if (g === undefined && b === undefined) {
            this.color = hex;
        }
        else {
            this.color = "#" + hex.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
        }
    }
    Color.prototype.fromRGB = function (r, g, b) {
        return new Color(r.toString(16), Number.parseInt(g.toString(16)), Number.parseInt(b.toString(16)));
    };
    Color.prototype.toRGB = function () {
        var r = Number.parseInt(this.color.substring(1, 3), 16);
        var g = Number.parseInt(this.color.substring(3, 5), 16);
        var b = Number.parseInt(this.color.substring(5, 7), 16);
        return [r, g, b];
    };
    Color.prototype.toRGBString = function (r, g, b) {
        var values = undefined;
        if (r === undefined || g === undefined || b === undefined) {
            values = this.toRGB();
        }
        else {
            values = [r, g, b];
        }
        return "rgb(" + values[0] + "," + values[1] + "," + values[2] + ")";
    };
    Color.prototype.darken = function (magnitude) {
        // magnitude = value from 0 to 255
        var values = this.toRGB();
        var a = values.map(function (v) { return Math.max(v - magnitude, 0).toString(16).padStart(2, "0"); });
        return "#" + a[0] + a[1] + a[2];
    };
    Color.prototype.lighten = function (magnitude) {
        // magnitude = value from 0 to 255
        var values = this.toRGB();
        var a = values.map(function (v) { return Math.min(v + magnitude, 255).toString(16).padStart(2, "0"); });
        return "#" + a[0] + a[1] + a[2];
    };
    Color.prototype.transparent = function (magnitude) {
        return this.color + magnitude.toString(16);
    };
    Color.prototype.lerp = function (target_color, percent) {
        var _a = this.toRGB(), r = _a[0], g = _a[1], b = _a[2];
        var _b = target_color.toRGB(), tr = _b[0], tg = _b[1], tb = _b[2];
        r += (tr - r) * percent;
        g += (tg - g) * percent;
        b += (tb - b) * percent;
        return this.toRGBString(r, g, b);
    };
    return Color;
}());
exports.Color = Color;
