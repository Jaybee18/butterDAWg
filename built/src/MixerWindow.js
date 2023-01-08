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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixerWindow = void 0;
var window_1 = require("./window");
var globals_1 = require("./globals");
var MixerWindow = /** @class */ (function (_super) {
    __extends(MixerWindow, _super);
    function MixerWindow() {
        return _super.call(this) || this;
    }
    MixerWindow.prototype.initialiseContent = function () {
        this.get(".content").appendChild(globals_1.React.createElement("div", { className: "mixer_wrapper" },
            globals_1.React.createElement("div", { className: "mixer" },
                globals_1.React.createElement("div", { className: "mixer_toolbar" },
                    globals_1.React.createElement("div", { className: "tool_button" },
                        globals_1.React.createElement("i", { className: "fa-solid fa-caret-right" })),
                    globals_1.React.createElement("div", { className: "tool_button" },
                        globals_1.React.createElement("i", { className: "fa-regular fa-hand-pointer" })),
                    globals_1.React.createElement("div", { className: "tool_button" },
                        globals_1.React.createElement("i", { className: "fa-solid fa-wave-square" }))),
                globals_1.React.createElement("div", { className: "mixer_channels_wrapper" },
                    globals_1.React.createElement("div", { className: "channel", id: "master_volume" },
                        globals_1.React.createElement("div", { className: "index_indicator" },
                            globals_1.React.createElement("p", null, "C")),
                        globals_1.React.createElement("div", { className: "channel_volume_indicator" })),
                    globals_1.React.createElement("div", { className: "channel", id: "master_channel" },
                        globals_1.React.createElement("div", { className: "index_indicator" },
                            globals_1.React.createElement("p", null, "M")),
                        globals_1.React.createElement("div", { className: "channel_label" },
                            globals_1.React.createElement("p", null, "Master")),
                        globals_1.React.createElement("div", { className: "channel_volume" },
                            globals_1.React.createElement("div", { className: "channel_volume_indicator" }),
                            globals_1.React.createElement("div", { className: "channel_toggle" },
                                globals_1.React.createElement("div", { className: "channel_toggle_green" })),
                            globals_1.React.createElement("div", { className: "channel_pan" },
                                globals_1.React.createElement("div", { className: "channel_pan_knob" }))),
                        globals_1.React.createElement("div", { className: "channel_volume_slider" },
                            globals_1.React.createElement("div", { className: "channel_volume_knob" },
                                globals_1.React.createElement("div", { className: "channel_volume_knob_peak" })),
                            globals_1.React.createElement("div", { className: "channel_volume_background" })),
                        globals_1.React.createElement("div", { className: "channel_links" })),
                    globals_1.React.createElement("div", { className: "mixer_seperator" },
                        globals_1.React.createElement("i", { className: "fa-solid fa-ellipsis-vertical" })))),
            globals_1.React.createElement("div", { className: "mixer_plugins" },
                globals_1.React.createElement("div", { className: "plugins_toolbar" }),
                globals_1.React.createElement("div", { className: "plugins_content" },
                    globals_1.React.createElement("div", { className: "channel_input" },
                        globals_1.React.createElement("i", { className: "fa-solid fa-right-to-bracket" }),
                        globals_1.React.createElement("div", { className: "header_snap_selector" },
                            globals_1.React.createElement("p", null, "(none)"),
                            globals_1.React.createElement("i", { className: "fa-solid fa-caret-right" })),
                        globals_1.React.createElement("i", { className: "fa-regular fa-clock" })),
                    globals_1.React.createElement("div", { className: "channel_plugins" }),
                    globals_1.React.createElement("div", { className: "channel_eq" }),
                    globals_1.React.createElement("div", { className: "channel_time" }),
                    globals_1.React.createElement("div", { className: "channel_output" },
                        globals_1.React.createElement("i", { className: "fa-solid fa-right-to-bracket" }),
                        globals_1.React.createElement("div", { className: "header_snap_selector" },
                            globals_1.React.createElement("p", null, "Out 1 - Out 2"),
                            globals_1.React.createElement("i", { className: "fa-solid fa-caret-right" })))))));
    };
    return MixerWindow;
}(window_1.Window));
exports.MixerWindow = MixerWindow;
