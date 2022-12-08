"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// random-noise-processor.js
var RandomNoiseProcessor = /** @class */ (function (_super) {
    __extends(RandomNoiseProcessor, _super);
    function RandomNoiseProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RandomNoiseProcessor.prototype.process = function (inputs, outputs, parameters) {
        var output = outputs[0];
        output.forEach(function (channel) {
            /*for (let i = 0; i < channel.length; i++) {
                channel[i] = Math.random() * 2 - 1;
            }*/
        });
        return true;
    };
    return RandomNoiseProcessor;
}(AudioWorkletProcessor));
registerProcessor("random-noise-processor", RandomNoiseProcessor);
