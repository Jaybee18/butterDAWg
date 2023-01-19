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
var Channel_1 = require("./Channel");
var Mixer_1 = require("./Mixer");
var ContextMenu_1 = require("./ContextMenu");
var MixerWindow = /** @class */ (function (_super) {
    __extends(MixerWindow, _super);
    function MixerWindow() {
        var _this = _super.call(this, false) || this;
        _this.channels = [];
        var temp_this = _this;
        _this.pluginSlotContextMenu = new ContextMenu_1.ContextMenu(globals_1.globals.plugins.map(function (plugin) { return plugin.getName(); }), globals_1.globals.plugins.map(function (plugin) { return function () {
            temp_this.getSelectedChannel().addPlugin(plugin);
            temp_this.updatePluginSlots(temp_this.getSelectedChannel());
            return true;
        }; }));
        _this.initialiseContent();
        return _this;
    }
    MixerWindow.prototype.initialiseContent = function () {
        var _this = this;
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
        // add the channels
        for (var i = 0; i < 20; i++) {
            var a = new Channel_1.Channel(i);
            this.get(".mixer_channels_wrapper").appendChild(a.element);
            this.channels.push(a);
        }
        this.channels[0].select(true);
        // add the slots
        for (var i = 0; i < 10; i++) {
            var tmp = new Mixer_1.PluginSlot("Slot " + i);
            tmp.setArrowEventListener("contextmenu", function (e) {
                _this.pluginSlotContextMenu.toggle(e);
            });
        }
        // !debugging!
        /*
        const pluginpath = "plugins/TestPlugin";
        let win = new PluginWindow(pluginpath);
        setTimeout(() => {
            let plugin = win.getPlugin();
            console.log(plugin);
            this.channels[0].addPlugin(plugin);
    
            // display the plugins of the first channel
            this.channels[0].select(true);
            let channel_plugins = this.channels[0].getPlugins();
            for (let i = 0; i < 10; i++) {
                if (i < channel_plugins.length) {
                    new PluginSlot(channel_plugins[i].getName());
                } else {
                    new PluginSlot("Slot " + i);
                }
            }
        }, 2000);*/
        this.setContentSize(760, 320);
    };
    MixerWindow.prototype.updatePluginSlots = function (channel) {
        var _this = this;
        // clear
        this.get(".channel_plugins").childNodes.forEach(function (v) { return _this.get(".channel_plugins").removeChild(v); });
        var channel_plugins = channel.getPlugins();
        for (var i = 0; i < 10; i++) {
            if (i < channel_plugins.length) {
                new Mixer_1.PluginSlot(channel_plugins[i].getName());
            }
            else {
                new Mixer_1.PluginSlot("Slot " + i);
            }
        }
    };
    MixerWindow.prototype.getSelectedChannel = function () {
        for (var i = 0; i < this.channels.length; i++) {
            if (this.channels[i].isSelected())
                return this.channels[i];
        }
        return null;
    };
    return MixerWindow;
}(window_1.Window));
exports.MixerWindow = MixerWindow;
