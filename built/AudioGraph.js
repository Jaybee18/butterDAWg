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
var Source_1 = require("./Source");
var globals_1 = require("./globals");
var screen = document.querySelector(".grid_background");
var screen_context = screen.getContext("2d");
screen_context.clearRect(0, 0, screen.width, screen.height);
var rect = { "width": 30, "height": 30 };
/*
const dpi = window.devicePixelRatio;
screen_context.scale(dpi, dpi);
screen_context.strokeStyle = "#0ab600cc";
screen_context.lineWidth = "2";
const cross_width = rect.width * 0.06;
var temptemp = 0.0001;
var temptemp2 = 0.0001;
for (let x = 0; x < screen.width; x+= rect.width) {
    for (let y = 0; y < screen.height; y+= rect.height) {
        var parab = (x) => {return temptemp * Math.pow(x - 0, 2);};
        var parab2 = (y) => {return temptemp2 * Math.pow(y -  0, 2);};
        screen_context.moveTo(parab2(y)+x+250, parab(x)+y-cross_width+250);
        screen_context.lineTo(parab2(y)+x+250, parab(x)+y+cross_width+250);
        screen_context.moveTo(parab2(y)+x-cross_width+250, parab(x)+y+250);
        screen_context.lineTo(parab2(y)+x+cross_width+250, parab(x)+y+250);
        temptemp = 0.0002 - 0.0004*((x)/500);
        temptemp2 = 0.0002 - 0.0004*((y)/500);
    }
}
screen_context.stroke();
*/
var warp = 15; // screen warp in percent
var parab = function (x) { return (0.00001 * warp) * Math.pow(x - 500, 2); };
screen_context.strokeStyle = "#00000000";
screen_context.lineWidth = 2;
var cross_width = rect.width * 0.04;
for (var i = 0; i < screen.width; i += rect.width) {
    var temp3 = 0;
    var temp = i / screen.height - 0.5;
    for (temp3; temp3 < screen.height; temp3 += rect.height) {
        var temp2 = temp3 / screen.width - 0.5;
        var y = temp3 - parab(i) * temp2 + 0;
        var x = i - parab(temp3) * temp + 10;
        screen_context.moveTo(0 + x, 0 + y - cross_width);
        screen_context.lineTo(0 + x, 0 + y + cross_width);
        screen_context.moveTo(0 + x - cross_width, 0 + y);
        screen_context.lineTo(0 + x + cross_width, 0 + y);
    }
}
screen_context.stroke();
// drag listener
/*
    ================== Nodes =====================
*/
var baseNode = '<div class="item">\
                    <div class="item_header">\
                        <p retro="Title">Title</p>\
                    </div>\
                    <div class="item_body"></div>\
                </div>';
var AudioGraphNode = /** @class */ (function () {
    function AudioGraphNode() {
        this.initElement();
        this.initComponents();
    }
    AudioGraphNode.prototype.initElement = function () {
        // create the HTML element
        this.element = (0, globals_1.createElement)(baseNode);
        // attach it to the document
        document.getElementById("audiograph").appendChild(this.element);
        // initialize move listeners
        var header = this.element.querySelector(".item_header");
        var tempthis = this;
        function nodemove(e) {
            tempthis.element.style.left = tempthis.element.offsetLeft + e.movementX + "px";
            tempthis.element.style.top = tempthis.element.offsetTop + e.movementY + "px";
        }
        header.addEventListener("mousedown", function () {
            document.addEventListener("mousemove", nodemove);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", nodemove);
        });
    };
    AudioGraphNode.prototype.setTitle = function (title) {
        var a = this.element.querySelector(".item_header > p");
        a.setAttribute("retro", title);
        a.innerText = title;
    };
    AudioGraphNode.prototype.initComponents = function () {
        throw Error("initComponents has to be implemented when inheriting AudioGraphNode");
    };
    AudioGraphNode.prototype.addComponent = function (component) {
        var body = this.element.querySelector(".item_body");
        body.appendChild(component.getElement());
        return component;
    };
    return AudioGraphNode;
}());
var nodes = [];
var nodeComponents = {
    "input": '<div class="input">\
                    <div class="connector"></div>\
                    <p retro="Input">Input</p>\
                </div>',
    "output": '<div class="output">\
                    <p retro="Output">Output</p>\
                    <div class="connector">\
                        <svg><path stroke-linejoin="bevel" stroke-width="2" stroke="#fff" fill="none"></path></svg>\
                    </div>\
                </div>',
    "iconbutton": '<div class="playbutton">\
                        <i class="fa-solid fa-play"></i>\
                    </div>',
    "stat": '<div class="stat">\
                <p retro="length: 12s">length: 12s</p>\
            </div>',
};
var Stat = /** @class */ (function () {
    function Stat(label, value) {
        var tmp = (0, globals_1.createElement)(nodeComponents["stat"]);
        var text = label + ": " + value;
        tmp.querySelector("p").setAttribute("retro", text);
        tmp.querySelector("p").innerText = text;
        this.element = tmp;
    }
    Stat.prototype.getElement = function () {
        return this.element;
    };
    return Stat;
}());
// the current input-connector that is being hovered
var currentHoverConnector = null;
var Input = /** @class */ (function () {
    function Input(label) {
        var _this = this;
        var tmp = (0, globals_1.createElement)(nodeComponents["input"]);
        tmp.querySelector("p").setAttribute("retro", label);
        tmp.querySelector("p").innerText = label;
        var knob = tmp.querySelector(".connector");
        knob.addEventListener("mouseenter", function () {
            currentHoverConnector = _this;
        });
        knob.addEventListener("mouseleave", function () {
            currentHoverConnector = null;
        });
        this.element = tmp;
    }
    Input.prototype.getConnector = function () {
        return this.element.querySelector(".connector");
    };
    Input.prototype.getElement = function () {
        return this.element;
    };
    return Input;
}());
var Output = /** @class */ (function () {
    function Output(label) {
        var tmp = (0, globals_1.createElement)(nodeComponents["output"]);
        tmp.querySelector("p").setAttribute("retro", label);
        tmp.querySelector("p").innerText = label;
        // list of connectors that this output is connected to
        var knob = tmp.querySelector(".connector");
        var path = tmp.querySelector("path");
        var svg = tmp.querySelector("svg");
        function updateConnection(e) {
            var svg_padding = 5;
            var yswap = e.clientY < (0, globals_1.cumulativeOffset)(knob).top;
            var xswap = e.clientX < (0, globals_1.cumulativeOffset)(knob).left;
            var both = xswap && yswap;
            if (xswap) {
                svg.style.left = e.clientX - (0, globals_1.cumulativeOffset)(knob).left - svg_padding + "px";
            }
            else {
                svg.style.left = knob.clientWidth / 2 - svg_padding + "px";
            }
            if (yswap) {
                svg.style.top = e.clientY - (0, globals_1.cumulativeOffset)(knob).top - svg_padding + "px";
            }
            else {
                svg.style.top = knob.clientHeight / 2 - svg_padding + "px";
            }
            var offset = (0, globals_1.cumulativeOffset)(tmp);
            var a = Math.abs(e.clientX - offset.left - tmp.clientWidth);
            var b = Math.abs(e.clientY - offset.top - tmp.clientHeight / 2);
            path.setAttribute("d", "M ".concat(svg_padding, " ").concat(svg_padding, " C ").concat((a + svg_padding) / 2, " 0 ").concat((a + svg_padding) / 2, " ").concat(b, " ").concat(a, " ").concat(b));
            if (!both) {
                if (xswap) {
                    path.setAttribute("d", "M ".concat(svg_padding, " ").concat(b, " C ").concat(a / 2, " ").concat(b, " ").concat(a / 2, " ").concat(svg_padding, " ").concat(a + svg_padding, " ").concat(svg_padding));
                }
                if (yswap) {
                    path.setAttribute("d", "M ".concat(svg_padding, " ").concat(b, " C ").concat(a / 2, " ").concat(b, " ").concat(a / 2, " ").concat(svg_padding, " ").concat(a, " ").concat(svg_padding));
                }
            }
            svg.setAttribute("width", (path.getBoundingClientRect().width + svg_padding * 2).toString());
            svg.setAttribute("height", (path.getBoundingClientRect().height + svg_padding * 2).toString());
        }
        tmp.querySelector(".connector").addEventListener("mousedown", function () {
            document.addEventListener("mousemove", updateConnection);
            svg.style.display = "block";
        });
        document.addEventListener("mouseup", function () {
            svg.style.display = "none";
            svg.setAttribute("width", "0");
            svg.setAttribute("height", "0");
        });
        this.element = tmp;
    }
    Output.prototype.updateConnections = function () {
        //
    };
    Output.prototype.getElement = function () {
        return this.element;
    };
    return Output;
}());
var IconButton = /** @class */ (function () {
    function IconButton(icon, onclick) {
        var tmp = (0, globals_1.createElement)(nodeComponents["iconbutton"]);
        tmp.innerHTML = icon;
        tmp.addEventListener("click", onclick);
        this.element = tmp;
    }
    IconButton.prototype.getElement = function () {
        return this.element;
    };
    IconButton.prototype.changeIcon = function (newicon) {
        this.element.innerHTML = newicon;
    };
    return IconButton;
}());
var AudioGraphSourceNode = /** @class */ (function (_super) {
    __extends(AudioGraphSourceNode, _super);
    function AudioGraphSourceNode(source) {
        var _this = _super.call(this) || this;
        _this.is_playing = false;
        _this.source = source;
        _this.sample = null;
        _this.setTitle(source.filename);
        return _this;
    }
    AudioGraphSourceNode.prototype.initComponents = function () {
        var _this = this;
        this.addComponent(new Output("outoput"));
        this.addComponent(new Stat("length", "12s"));
        var playbutton = new IconButton('<i class="fa-solid fa-play"></i>', function () {
            // change the icon according to the play state
            _this.is_playing = !_this.is_playing;
            if (_this.is_playing) {
                playbutton.changeIcon('<i class="fa-solid fa-pause"></i>');
                _this.play();
            }
            else {
                playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
                _this.pause();
            }
        });
        this.addComponent(playbutton);
    };
    AudioGraphSourceNode.prototype.play = function () {
        this.sample = globals_1.globals.audiocontext.createBufferSource();
        this.sample.buffer = this.source.getAudioBuffer();
        this.sample.connect(globals_1.globals.audiocontext.destination);
        this.sample.start();
    };
    AudioGraphSourceNode.prototype.pause = function () {
        this.sample.stop();
    };
    return AudioGraphSourceNode;
}(AudioGraphNode));
var AudioGraphOutputNode = /** @class */ (function (_super) {
    __extends(AudioGraphOutputNode, _super);
    function AudioGraphOutputNode() {
        var _this = _super.call(this) || this;
        _this.setTitle("Output 1");
        return _this;
    }
    AudioGraphOutputNode.prototype.initComponents = function () {
        this.addComponent(new Input("inputo"));
        this.addComponent(new Stat("channels", "2"));
    };
    return AudioGraphOutputNode;
}(AudioGraphNode));
var Connection = /** @class */ (function () {
    function Connection(output, input) {
        // both parameters are I/O elements
    }
    return Connection;
}());
// add initial nodes to screen
var source = new Source_1.Source("./files/0Current project/kick7.1.wav");
var nodeee = new AudioGraphSourceNode(source);
var outpotu = new AudioGraphOutputNode();
// initialize screen drag listener
function screendrag(e) {
    nodes.forEach(function (element) {
        var tmp = element.element;
        tmp.style.left = tmp.offsetLeft + e.movementX + "px";
        tmp.style.top = tmp.offsetTop + e.movementY + "px";
    });
}
document.addEventListener("mousedown", function (e) {
    if (e.button === 1) {
        document.addEventListener("mousemove", screendrag);
    }
});
document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", screendrag);
});
