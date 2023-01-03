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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginNode = exports.AudioGraphAnalyzerNode = exports.AudioGraphOutputNode = exports.AudioGraphSourceNode = exports.AudioGraphNode = exports.audio_graph_nodes = void 0;
var globals_1 = require("../src/globals");
exports.audio_graph_nodes = [];
/*let screen = <HTMLCanvasElement> document.querySelector(".grid_background")!;
let screen_context = screen.getContext("2d");
screen_context.clearRect(0, 0, screen.width, screen.height);
let rect = {"width": 30, "height": 30};
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
/*let warp = 15; // screen warp in percent
var parab = (x:number) => {return (0.00001 * warp) * Math.pow(x - 500, 2);};
screen_context.strokeStyle = "#00FF0000";
screen_context.lineWidth = 2;
const cross_width = rect.width * 0.04;
for (let i = 0; i < screen.width; i+= rect.width) {
    let temp3 = 0;
    let temp = i/screen.height-0.5;
    for (temp3; temp3 < screen.height; temp3+= rect.height) {
        let temp2 = temp3/screen.width-0.5;
        let y = temp3-parab(i)*temp2 + 0;
        let x = i-parab(temp3)*temp + 10;
        screen_context.moveTo(0+x, 0+y-cross_width);
        screen_context.lineTo(0+x, 0+y+cross_width);
        screen_context.moveTo(0+x-cross_width, 0+y);
        screen_context.lineTo(0+x+cross_width, 0+y);
    }
}
screen_context.stroke();*/
var overlapping = function (node1, node2) {
    var pos1 = node1.getPosition();
    var pos2 = node2.getPosition();
    var d1 = node1.getDimensions();
    var d2 = node2.getDimensions();
    var res = true;
    if (pos1[0] > pos2[0] + d2[0]) {
        res = false;
    }
    if (pos1[0] + d1[0] < pos2[0]) {
        res = false;
    }
    if (pos1[1] > pos2[1] + d2[1]) {
        res = false;
    }
    if (pos1[1] + d1[1] < pos2[1]) {
        res = false;
    }
    return res;
};
var minimal_offset = function (node1, node2) {
    // calculate the minimal distance node2 has to be moved, to not collide with node1 anymore
    var pos1 = node1.getPosition();
    var pos2 = node2.getPosition();
    var d1 = node1.getDimensions();
    var d2 = node2.getDimensions();
    var delta1 = (pos1[0] - pos2[0]) + d2[0];
    var delta2 = pos2[0] - (pos1[0] + d1[0]);
    var delta3 = pos1[1] - (pos2[1] + d2[1]);
    var delta4 = pos2[1] - (pos1[1] + d1[1]);
    var min = Math.min(delta1, delta2, delta3, delta4);
    //console.log(delta1, delta2, delta3, delta4)
    var offset = 20;
    switch (min) {
        case delta1:
            return [Math.abs(delta1) + offset, 0];
        case delta2:
            return [-(Math.abs(delta2) + offset), 0];
        case delta3:
            return [0, Math.abs(delta3) + offset];
        case delta4:
            return [0, -(Math.abs(delta4) + offset)];
        default:
            return [10, 10];
            break;
    }
};
// base class for every object in the audio graph
var AudioGraphObject = /** @class */ (function () {
    function AudioGraphObject() {
        this.initElement();
        // make element unique
        this.id = Math.round(Date.now() * Math.random()).toString();
        this.element.id = this.id;
        // add the generated element to the audio graph
        document.getElementById("audiograph").appendChild(this.element);
        // rudimentary positioning, by just placing every node to the right of the last placed node
        if (exports.audio_graph_nodes.length > 0) {
            var last_node = exports.audio_graph_nodes[exports.audio_graph_nodes.length - 1];
            var tmp_pos = last_node.getPosition();
            this.moveTo(tmp_pos[0] + last_node.getDimensions()[0] + 40, tmp_pos[1]);
        }
    }
    AudioGraphObject.prototype.moveTo = function (x, y) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    };
    AudioGraphObject.prototype.move = function (deltax, deltay) {
        this.element.style.left = this.element.clientLeft + deltax + "px";
        this.element.style.top = this.element.clientTop + deltay + "px";
    };
    AudioGraphObject.prototype.remove = function () {
        document.getElementById(this.id).remove();
    };
    AudioGraphObject.prototype.getElement = function () {
        return this.element;
    };
    AudioGraphObject.prototype.getPosition = function () {
        return [this.element.offsetLeft, this.element.offsetTop];
    };
    AudioGraphObject.prototype.getDimensions = function () {
        return [this.element.clientWidth, this.element.clientHeight];
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
        exports.audio_graph_nodes.push(_this);
        return _this;
    }
    AudioGraphNode.prototype.initElement = function () {
        var _this = this;
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
            // bring to front
            _this.element.style.zIndex = "2";
            document.addEventListener("mousemove", nodemove);
        });
        document.addEventListener("mouseup", function () {
            // normalize
            _this.element.style.zIndex = "1";
            document.removeEventListener("mousemove", nodemove);
        });
    };
    AudioGraphNode.prototype.setTitle = function (title) {
        var a = this.element.querySelector(".item_header > p");
        a.setAttribute("retro", title);
        a.innerText = title;
    };
    AudioGraphNode.prototype.connect = function (to) {
        this.audio_node.connect(to.getAudioNode());
    };
    AudioGraphNode.prototype.getAudioNode = function () {
        return this.audio_node;
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
exports.AudioGraphNode = AudioGraphNode;
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
    "indicator": '<div class="node_indicator">\
            <div class="lamp"></div>\
        </div>',
    "canvas": '<div class="node_canvas">\
                    <div class="canvas_wrapper">\
                        <div></div>\
                        <canvas></canvas>\
                    </div>\
                </div>',
    "checkbox": '<div class="node_checkbox">\
    <p retro="loop">loop</p>\
    <div class="radio_btn" style="position: relative; box-shadow: 0 0 1px 0px #ffffff8a;"><div class="radio_btn_green" style="filter: blur(1px);"></div></div>\
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
        _this.label = label;
        var tmp = (0, globals_1.createElement)(nodeComponents["stat"]);
        var text = label + ": " + value;
        tmp.querySelector("p").setAttribute("retro", text);
        tmp.querySelector("p").innerText = text;
        _this.element = tmp;
        return _this;
    }
    Stat.prototype.setValue = function (value) {
        this.element.querySelector("p").innerText = this.label + ": " + value;
    };
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
    Input.prototype.getParent = function () {
        return this.parent;
    };
    Input.prototype.getPosition = function () {
        var connector = (0, globals_1.cumulativeOffset)(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - 107];
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
                    return [e.clientX - _this.parent.getElement().clientWidth + 17, e.clientY - 107 - 9];
                } };
            tmp_connection.update(impostor);
        };
        tmp.querySelector(".connector").addEventListener("mousedown", function () {
            tmp_connection = new Connection(_this, null);
            document.addEventListener("mousemove", updateConnection);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", updateConnection);
            if (tmp_connection === null)
                return;
            // if the mouse is currently hovering over an input connector
            // create a new permanent Connection between these two nodes
            if (currentHoverConnector !== null) {
                new Connection(_this, currentHoverConnector);
                // connect the audio nodes
                _this.parent.connect(currentHoverConnector.getParent());
            }
            tmp_connection.remove();
            tmp_connection = null;
        });
        _this.element = tmp;
        return _this;
    }
    Output.prototype.addMoveCallback = function (callback) {
        this.parent.addMoveCallback(callback);
    };
    Output.prototype.getPosition = function () {
        var connector = (0, globals_1.cumulativeOffset)(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - 107]; // - this.parent.getElement().clientHeight + 16 + 10 + 9]; // +9
    };
    return Output;
}(AudioGraphNodeComponent));
var Indicator = /** @class */ (function (_super) {
    __extends(Indicator, _super);
    function Indicator() {
        var _this = _super.call(this) || this;
        var temp = (0, globals_1.createElement)(nodeComponents["indicator"]);
        _this.element = temp;
        return _this;
    }
    Indicator.prototype.setValue = function (value) {
        var lamp = this.element.querySelector(".lamp");
        lamp.style.backgroundColor = "#00ff00" + value.toString(16).padStart(2, "0");
    };
    return Indicator;
}(AudioGraphNodeComponent));
var NodeCanvas = /** @class */ (function (_super) {
    __extends(NodeCanvas, _super);
    function NodeCanvas() {
        var _this = _super.call(this) || this;
        var tmp = (0, globals_1.createElement)(nodeComponents["canvas"]);
        var c = tmp.querySelector("canvas");
        c.width = 180;
        var ctx = c.getContext("2d");
        var cwidth = c.width;
        var cheight = c.height;
        ctx.fillStyle = "#3f484d";
        ctx.fillRect(0, 0, cwidth, cheight);
        _this.element = tmp;
        return _this;
    }
    NodeCanvas.prototype.getCanvas = function () {
        return this.element.querySelector("canvas");
    };
    NodeCanvas.prototype.clear = function () {
        var c = this.element.querySelector("canvas");
        var ctx = c.getContext("2d");
        ctx.fillRect(0, 0, c.width, c.height);
    };
    return NodeCanvas;
}(AudioGraphNodeComponent));
var Checkbox = /** @class */ (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox() {
        var _this = _super.call(this) || this;
        var tmp = (0, globals_1.createElement)(nodeComponents["checkbox"]);
        _this.checked = false;
        var radio_btn = tmp.querySelector(".radio_btn");
        var radio_btn_green = radio_btn.querySelector(".radio_btn_green");
        radio_btn_green.style.backgroundColor = globals_1.globals.grey;
        radio_btn.addEventListener("click", function () {
            _this.checked = !_this.checked;
            radio_btn_green.style.backgroundColor = _this.checked ? globals_1.globals.green : globals_1.globals.grey;
            _this.changeListener();
        });
        _this.element = tmp;
        return _this;
    }
    Checkbox.prototype.addChangeListener = function (listener) {
        this.changeListener = listener;
    };
    return Checkbox;
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
        _this.audio_node = globals_1.globals.audiocontext.createBufferSource();
        _this.setTitle(source.getName());
        _this.initComponents();
        return _this;
    }
    AudioGraphSourceNode.prototype.initComponents = function () {
        var _this = this;
        this.addComponent(new Output(this, "output"));
        this.addComponent(new Stat("length", this.source.getLength().toFixed(2) + "s"));
        var checkbox = new Checkbox();
        checkbox.addChangeListener(function () {
            _this.loop = checkbox.checked;
        });
        this.addComponent(checkbox);
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
        this.audio_node = new AudioBufferSourceNode(globals_1.globals.audiocontext, {
            buffer: this.source.getAudioBuffer(),
            loop: this.loop
        });
        //this.audio_node = globals.audiocontext.createBufferSource();
        //(<AudioBufferSourceNode> this.audio_node).buffer = this.source.getAudioBuffer();
        //this.audio_node.connect(globals.audiocontext.destination);
        this.audio_node.connect(this.destination);
        var playbutton = null;
        this.components.forEach(function (component) {
            if (component instanceof IconButton) {
                playbutton = component;
            }
        });
        this.audio_node.addEventListener("ended", function (e) {
            playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
            _this.pause();
        });
        this.audio_node.start();
        this.is_playing = true;
    };
    AudioGraphSourceNode.prototype.connect = function (to) {
        this.destination = to.getAudioNode();
    };
    AudioGraphSourceNode.prototype.pause = function () {
        this.audio_node.stop();
        this.is_playing = false;
    };
    AudioGraphSourceNode.prototype.getOutput = function (index) {
        return this.components[index];
    };
    return AudioGraphSourceNode;
}(AudioGraphNode));
exports.AudioGraphSourceNode = AudioGraphSourceNode;
var AudioGraphOutputNode = /** @class */ (function (_super) {
    __extends(AudioGraphOutputNode, _super);
    function AudioGraphOutputNode(destination) {
        var _this = _super.call(this, false) || this;
        _this.audio_node = destination;
        _this.initComponents();
        _this.setTitle("Output 1");
        return _this;
    }
    AudioGraphOutputNode.prototype.initComponents = function () {
        this.addComponent(new Input(this, "input"));
        this.addComponent(new Stat("channels", this.audio_node.channelCount.toString()));
    };
    AudioGraphOutputNode.prototype.getInput = function (index) {
        return this.components[index];
    };
    return AudioGraphOutputNode;
}(AudioGraphNode));
exports.AudioGraphOutputNode = AudioGraphOutputNode;
var AudioGraphAnalyzerNode = /** @class */ (function (_super) {
    __extends(AudioGraphAnalyzerNode, _super);
    function AudioGraphAnalyzerNode() {
        var _this = _super.call(this, true) || this;
        _this.audio_node = new AnalyserNode(globals_1.globals.audiocontext);
        _this.frequency = false;
        _this.setTitle("Analyser");
        // TODO maybe make these parameters optionally customizable?
        var fftSize = Math.pow(2, 10);
        var timeout = 10;
        var temp_this = _this;
        var maxY = 150;
        var maxX = 200;
        function execute1() {
            return __awaiter(this, void 0, void 0, function () {
                var _loop_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _loop_1 = function () {
                                var bufferLength, dataArray, tmp_array, canvas_element, ctx, scale;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, timeout); })];
                                        case 1:
                                            _b.sent();
                                            temp_this.audio_node.fftSize = fftSize;
                                            bufferLength = temp_this.audio_node.frequencyBinCount;
                                            dataArray = new Uint8Array(bufferLength);
                                            if (temp_this.frequency) {
                                                temp_this.audio_node.getByteFrequencyData(dataArray);
                                            }
                                            else {
                                                temp_this.audio_node.getByteTimeDomainData(dataArray);
                                            }
                                            tmp_array = [];
                                            dataArray.forEach(function (v) { return tmp_array.push((1 - v / 255) * maxY); });
                                            // draw on canvas
                                            temp_this.canvas.clear();
                                            canvas_element = temp_this.canvas.getCanvas();
                                            ctx = canvas_element.getContext("2d");
                                            ctx.lineWidth = 2;
                                            ctx.strokeStyle = "#fff";
                                            ctx.beginPath();
                                            scale = maxX / Math.log10(bufferLength);
                                            tmp_array.forEach(function (v, i) {
                                                ctx.lineTo(temp_this.frequency ? Math.log10(i) * scale : i, v);
                                            });
                                            ctx.stroke();
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _a.label = 1;
                        case 1:
                            if (!true) return [3 /*break*/, 3];
                            return [5 /*yield**/, _loop_1()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        execute1();
        return _this;
    }
    AudioGraphAnalyzerNode.prototype.initComponents = function () {
        this.addComponent(new Input(this, "input"));
        this.addComponent(new Output(this, "output"));
        this.canvas = new NodeCanvas();
        this.addComponent(this.canvas);
    };
    AudioGraphAnalyzerNode.prototype.setValue = function (value) {
        this.indicator.setValue(value);
    };
    return AudioGraphAnalyzerNode;
}(AudioGraphNode));
exports.AudioGraphAnalyzerNode = AudioGraphAnalyzerNode;
/*class PassthroughNode extends AudioGraphNode {
    constructor() {
        super();
        globals.audiocontext.audioWorklet.addModule("AudioNodes/passthrough.js").then(() => {
            console.log("passthroug module loaded")
            this.audio_node = new AudioWorkletNode(globals.audiocontext, "passthrough");
        });
    }

    initComponents(): void {
        this.addComponent(new Input(this, "input"));
        this.addComponent(new Output(this, "output"));
    }
}*/
var PluginNode = /** @class */ (function (_super) {
    __extends(PluginNode, _super);
    function PluginNode(plugin) {
        var _this = _super.call(this, false) || this;
        _this.plugin = plugin;
        // try initialising the audio node
        try {
            // audio module has already been added, so just create the audio node
            _this.audio_node = new AudioWorkletNode(globals_1.globals.audiocontext, _this.plugin.getName());
            _this.initComponents();
        }
        catch (error) {
            console.log("error");
            // audio module has to be registered first before using it
            _this.plugin.loadPlugin().then(function () {
                _this.audio_node = new AudioWorkletNode(globals_1.globals.audiocontext, _this.plugin.getName());
                _this.initComponents();
            });
        }
        return _this;
    }
    PluginNode.prototype.initComponents = function () {
        var _this = this;
        // I/O
        for (var i = 0; i < this.audio_node.numberOfInputs; i++) {
            this.addComponent(new Input(this, "input " + i.toString()));
        }
        for (var i = 0; i < this.audio_node.numberOfOutputs; i++) {
            this.addComponent(new Output(this, "output " + i.toString()));
        }
        // parameters
        //console.log((<AudioParamMap> (<any> this.audio_node).parameters));
        this.audio_node.parameters.forEach(function (element) {
            _this.addComponent(new Stat("idk", element.value.toString()));
        });
        //this.position();
    };
    return PluginNode;
}(AudioGraphNode));
exports.PluginNode = PluginNode;
/* Delay Node */
/*
    given a amount of time in seconds, the delay is converted to frames
    with respect to the samplerate. And when an input comes in, it gets
    buffered (buffer has the previously calculated frame size), and for
    the delay time, only frames with value 0 get output
*/
/* Channel splitter Node */
/*
    Splits a given combined Input/Output into its respective channels
*/
