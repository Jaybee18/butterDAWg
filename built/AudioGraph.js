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
// base class for every object in the audio graph
var AudioGraphObject = /** @class */ (function () {
    function AudioGraphObject() {
        this.initElement();
        // make element unique
        this.id = Math.round(Date.now() * Math.random()).toString();
        this.element.id = this.id;
        // add the generated element to the audio graph
        document.getElementById("audiograph").appendChild(this.element);
    }
    AudioGraphObject.prototype.remove = function () {
        document.getElementById(this.id).remove();
    };
    AudioGraphObject.prototype.getElement = function () {
        return this.element;
    };
    return AudioGraphObject;
}());
/*
    ================== Paths =====================
*/
var Connection = /** @class */ (function (_super) {
    __extends(Connection, _super);
    function Connection(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        _this.path = "M 0 0 Z";
        var pathobject = _this.element.querySelector("path");
        pathobject.setAttribute("d", _this.path);
        // connect update function to both nodes' movement update functions
        // to update the path while the nodes are being moved
        // (if the connection is with da mouse, the movement update callback will be
        //  set up by the managing component, because the mouse event is needed as a parameter here)
        if (_this.to !== null) {
            from.addMoveCallback(function () { _this.update(); });
            to.addMoveCallback(function () { _this.update(); });
            _this.update();
        }
        return _this;
    }
    Connection.prototype.initElement = function () {
        this.element = (0, globals_1.createElement)('<svg><path stroke-linejoin="bevel" stroke-width="2" stroke="#fff" fill="none"></path></svg>');
        this.element.style.position = "absolute";
        this.element.style.pointerEvents = "none";
        this.element.style.filter = "blur(1px)";
    };
    Connection.prototype.update = function (e) {
        // get the positions of the nodes
        var from_pos = this.from.getPosition();
        var to_pos = this.to === null ? e.getPosition() : this.to.getPosition();
        // calculate connection to the to-node
        var delta = [to_pos[0] - from_pos[0], to_pos[1] - from_pos[1]];
        this.path = "M ".concat(delta[0] < 0 ? Math.abs(delta[0]) : 0, " ").concat(delta[1] < 0 ? Math.abs(delta[1]) : 0, "         c ").concat(delta[0] / 2, " ").concat(0, " ").concat(delta[0] / 2, " ").concat(delta[1], " ").concat(delta[0], " ").concat(delta[1]);
        this.element.querySelector("path").setAttribute("d", this.path);
        // offset the svg if necessary && indirectly update the from-position
        var offset = [Math.min(0, delta[0]), Math.min(0, delta[1])];
        this.element.style.left = (from_pos[0] + offset[0]).toString() + "px";
        this.element.style.top = (from_pos[1] + offset[1]).toString() + "px";
        // update the svg's size to match the new dimensions of the graph
        this.element.setAttribute("width", Math.abs(delta[0]).toString() + 10);
        this.element.setAttribute("height", Math.abs(delta[1]).toString() + 10);
    };
    Connection.prototype.setTo = function (newTo) {
        var _this = this;
        this.to = newTo;
        if (newTo !== null) {
            this.to.addMoveCallback(function () { _this.update(); });
            this.update();
        }
    };
    return Connection;
}(AudioGraphObject));
/*
    ================== Nodes =====================
*/
var baseNode = '<div class="item">\
                    <div class="item_header">\
                        <p retro="Title">Title</p>\
                    </div>\
                    <div class="item_body"></div>\
                </div>';
var AudioGraphNode = /** @class */ (function (_super) {
    __extends(AudioGraphNode, _super);
    function AudioGraphNode(callInitComponents) {
        if (callInitComponents === void 0) { callInitComponents = true; }
        var _this = _super.call(this) || this;
        _this.movementCallbacks = [];
        _this.components = [];
        if (callInitComponents)
            _this.initComponents();
        return _this;
    }
    AudioGraphNode.prototype.initElement = function () {
        // create the HTML element
        this.element = (0, globals_1.createElement)(baseNode);
        // initialize move listeners
        var header = this.element.querySelector(".item_header");
        var tempthis = this;
        function nodemove(e) {
            tempthis.element.style.left = tempthis.element.offsetLeft + e.movementX + "px";
            tempthis.element.style.top = tempthis.element.offsetTop + e.movementY + "px";
            tempthis.movementCallbacks.forEach(function (callback) { callback(); });
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
    AudioGraphNode.prototype.addComponent = function (component) {
        // component of type Node Component
        // aka Output, Input, Stat, ...
        var body = this.element.querySelector(".item_body");
        body.appendChild(component.getElement());
        this.components.push(component);
        return component;
    };
    AudioGraphNode.prototype.addMoveCallback = function (callback) {
        this.movementCallbacks.push(callback);
    };
    return AudioGraphNode;
}(AudioGraphObject));
var nodes = [];
var nodeComponents = {
    "input": '<div class="input">\
                    <div class="connector"></div>\
                    <p retro="Input">Input</p>\
                </div>',
    "output": '<div class="output">\
                    <p retro="Output">Output</p>\
                    <div class="connector"></div>\
                </div>',
    "iconbutton": '<div class="playbutton">\
                        <i class="fa-solid fa-play"></i>\
                    </div>',
    "stat": '<div class="stat">\
                <p retro="length: 12s">length: 12s</p>\
            </div>',
};
var AudioGraphNodeComponent = /** @class */ (function () {
    function AudioGraphNodeComponent() {
    }
    AudioGraphNodeComponent.prototype.getElement = function () {
        return this.element;
    };
    return AudioGraphNodeComponent;
}());
var Stat = /** @class */ (function (_super) {
    __extends(Stat, _super);
    function Stat(label, value) {
        var _this = _super.call(this) || this;
        var tmp = (0, globals_1.createElement)(nodeComponents["stat"]);
        var text = label + ": " + value;
        tmp.querySelector("p").setAttribute("retro", text);
        tmp.querySelector("p").innerText = text;
        _this.element = tmp;
        return _this;
    }
    return Stat;
}(AudioGraphNodeComponent));
// the current input-connector that is being hovered
var currentHoverConnector = null;
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input(parent, label) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
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
        _this.element = tmp;
        return _this;
    }
    Input.prototype.addMoveCallback = function (callback) {
        this.parent.addMoveCallback(callback);
    };
    Input.prototype.getPosition = function () {
        var connector = (0, globals_1.cumulativeOffset)(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - this.parent.getElement().clientHeight + 8];
    };
    return Input;
}(AudioGraphNodeComponent));
var Output = /** @class */ (function (_super) {
    __extends(Output, _super);
    function Output(parent, label) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        var tmp = (0, globals_1.createElement)(nodeComponents["output"]);
        tmp.querySelector("p").setAttribute("retro", label);
        tmp.querySelector("p").innerText = label;
        var tmp_connection = null;
        var updateConnection = function (e) {
            // check if in proximity of input-connector
            if (currentHoverConnector !== null) {
                tmp_connection.setTo(currentHoverConnector);
            }
            else {
                tmp_connection.setTo(null);
            }
            var impostor = { getPosition: function () {
                    return [e.clientX - _this.parent.getElement().clientWidth + 17, e.clientY - _this.parent.getElement().clientHeight + 35];
                } };
            tmp_connection.update(impostor);
        };
        tmp.querySelector(".connector").addEventListener("mousedown", function () {
            tmp_connection = new Connection(_this, null);
            document.addEventListener("mousemove", updateConnection);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", updateConnection);
            // if the mouse is currently hovering over an input connector
            // create a new permanent Connection between these two nodes
            if (currentHoverConnector !== null) {
                new Connection(_this, currentHoverConnector);
            }
            if (tmp_connection != null) {
                tmp_connection.remove();
                tmp_connection = null;
            }
        });
        _this.element = tmp;
        return _this;
    }
    Output.prototype.addMoveCallback = function (callback) {
        this.parent.addMoveCallback(callback);
    };
    Output.prototype.getPosition = function () {
        var connector = (0, globals_1.cumulativeOffset)(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - this.parent.getElement().clientHeight + 35]; // +9
    };
    return Output;
}(AudioGraphNodeComponent));
var IconButton = /** @class */ (function (_super) {
    __extends(IconButton, _super);
    function IconButton(icon, onclick) {
        var _this = _super.call(this) || this;
        // TODO any type
        var tmp = (0, globals_1.createElement)(nodeComponents["iconbutton"]);
        tmp.innerHTML = icon;
        tmp.addEventListener("click", onclick);
        _this.element = tmp;
        return _this;
    }
    IconButton.prototype.changeIcon = function (newicon) {
        this.element.innerHTML = newicon;
    };
    return IconButton;
}(AudioGraphNodeComponent));
var AudioGraphSourceNode = /** @class */ (function (_super) {
    __extends(AudioGraphSourceNode, _super);
    function AudioGraphSourceNode(source) {
        var _this = _super.call(this, false) || this;
        _this.source = source;
        _this.is_playing = false;
        _this.sample = null;
        _this.setTitle(source.getName());
        _this.initComponents();
        return _this;
    }
    AudioGraphSourceNode.prototype.initComponents = function () {
        var _this = this;
        for (var i = 0; i < this.source.getChannels() + 1; i++) {
            this.addComponent(new Output(this, "channel " + i));
        }
        this.addComponent(new Stat("length", this.source.getLength().toFixed(2) + "s"));
        var playbutton = new IconButton('<i class="fa-solid fa-play"></i>', function () {
            // change the icon according to the play state
            if (_this.is_playing) {
                playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
                _this.pause();
            }
            else {
                playbutton.changeIcon('<i class="fa-solid fa-pause"></i>');
                _this.play();
            }
        });
        this.addComponent(playbutton);
    };
    AudioGraphSourceNode.prototype.play = function () {
        var _this = this;
        this.sample = globals_1.globals.audiocontext.createBufferSource();
        this.sample.buffer = this.source.getAudioBuffer();
        this.sample.connect(globals_1.globals.audiocontext.destination);
        var playbutton = null;
        this.components.forEach(function (component) {
            if (component instanceof IconButton) {
                playbutton = component;
            }
        });
        this.sample.addEventListener("ended", function (e) {
            playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
            _this.pause();
        });
        this.sample.start();
        this.is_playing = true;
    };
    AudioGraphSourceNode.prototype.pause = function () {
        this.sample.stop();
        this.is_playing = false;
    };
    AudioGraphSourceNode.prototype.getOutput = function (index) {
        return this.components[index];
    };
    return AudioGraphSourceNode;
}(AudioGraphNode));
var AudioGraphOutputNode = /** @class */ (function (_super) {
    __extends(AudioGraphOutputNode, _super);
    function AudioGraphOutputNode(destination) {
        var _this = _super.call(this, false) || this;
        _this.destination = destination;
        _this.initComponents();
        _this.setTitle("Output 1");
        return _this;
    }
    AudioGraphOutputNode.prototype.initComponents = function () {
        for (var i = 0; i < this.destination.channelCount; i++) {
            this.addComponent(new Input(this, "channel " + i));
        }
        this.addComponent(new Stat("channels", this.destination.channelCount.toString()));
    };
    AudioGraphOutputNode.prototype.getInput = function (index) {
        return this.components[index];
    };
    return AudioGraphOutputNode;
}(AudioGraphNode));
/* Delay Node */
/*
    given a amount of time in seconds, the delay is converted to frames
    with respect to the samplerate. And when an input comes in, it gets
    buffered (buffer has the previously calculated frame size), and for
    the delay time, only frames with value 0 get output
*/
// add initial nodes to screen
var source = new Source_1.Source("./files/0Current project/kick7.1.wav");
var node1 = new AudioGraphSourceNode(source);
var node2 = new AudioGraphOutputNode(globals_1.globals.audiocontext.destination);
var node3 = new AudioGraphOutputNode(globals_1.globals.audiocontext.destination);
// initialize screen drag listener
function screendrag(e) {
    nodes.forEach(function (element) {
        var tmp = element.getElement();
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
