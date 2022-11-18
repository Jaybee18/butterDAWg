import { Source } from "./Source";
import { createElement, cumulativeOffset, globals } from "./globals";

let screen = <HTMLCanvasElement> document.querySelector(".grid_background")!;
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
let warp = 15; // screen warp in percent
var parab = (x:number) => {return (0.00001 * warp) * Math.pow(x - 500, 2);};
screen_context.strokeStyle = "#00000000";
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
screen_context.stroke();

// drag listener


/*
    ================== Nodes =====================
*/
let baseNode = '<div class="item">\
                    <div class="item_header">\
                        <p retro="Title">Title</p>\
                    </div>\
                    <div class="item_body"></div>\
                </div>';
class AudioGraphNode {

    element: HTMLElement;

    constructor() {
        this.initElement();
        this.initComponents();
    }

    initElement() {
        // create the HTML element
        this.element = createElement(baseNode)

        // attach it to the document
        document.getElementById("audiograph").appendChild(this.element)

        // initialize move listeners
        let header = this.element.querySelector(".item_header");
        let tempthis = this;
        function nodemove(e: MouseEvent) {
            tempthis.element.style.left = tempthis.element.offsetLeft + e.movementX + "px";
            tempthis.element.style.top = tempthis.element.offsetTop + e.movementY + "px";
        }
        header.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", nodemove);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", nodemove);
        });
    }

    setTitle(title: string) {
        let a = <HTMLElement> this.element.querySelector(".item_header > p");
        a.setAttribute("retro", title);
        a.innerText = title;
    }

    initComponents() {
        throw Error("initComponents has to be implemented when inheriting AudioGraphNode");
    }

    addComponent(component: AudioGraphNodeComponent) {
        // component of type Node Component
        // aka Output, Input, Stat, ...
        let body = this.element.querySelector(".item_body");
        body.appendChild(component.getElement());
        return component;
    }
}

var nodes: Array<AudioGraphNode> = [];
let nodeComponents = {
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


class AudioGraphNodeComponent {
    constructor(){}

    getElement(): HTMLElement {
        throw new Error("getElement has to be implemented by subclasses of AudioGraphNodeComponent");
    }
}

class Stat extends AudioGraphNodeComponent {

    element: HTMLElement;

    constructor(label:string, value:string) {
        super();
        let tmp = createElement(nodeComponents["stat"]);
        let text = label + ": " + value;
        tmp.querySelector("p").setAttribute("retro", text);
        tmp.querySelector("p").innerText = text;
        this.element = tmp;
    }

    getElement() {
        return this.element;
    }
}

// the current input-connector that is being hovered
var currentHoverConnector = null;

class Input extends AudioGraphNodeComponent {

    element: HTMLElement;

    constructor(label:string) {
        super();
        let tmp = createElement(nodeComponents["input"]);
        tmp.querySelector("p").setAttribute("retro", label);
        tmp.querySelector("p").innerText = label;

        let knob = tmp.querySelector(".connector");
        knob.addEventListener("mouseenter", () => {
            currentHoverConnector = this;
        });
        knob.addEventListener("mouseleave", () => {
            currentHoverConnector = null;
        });

        this.element = tmp;
    }

    getConnector() {
        return this.element.querySelector(".connector");
    }

    getElement() {
        return this.element;
    }
}

class Output extends AudioGraphNodeComponent {

    element: HTMLElement;

    constructor(label:string) {
        super();
        let tmp = createElement(nodeComponents["output"]);
        tmp.querySelector("p").setAttribute("retro", label);
        tmp.querySelector("p").innerText = label;
        // list of connectors that this output is connected to
        let knob = <HTMLElement> tmp.querySelector(".connector");
        let path = tmp.querySelector("path");
        let svg = tmp.querySelector("svg");
        function updateConnection(e: MouseEvent) {
            let svg_padding = 5;
            let yswap = e.clientY < cumulativeOffset(knob).top;
            let xswap = e.clientX < cumulativeOffset(knob).left;
            let both = xswap && yswap;
            if (xswap) {
                svg.style.left = e.clientX - cumulativeOffset(knob).left - svg_padding + "px";
            } else {
                svg.style.left = knob.clientWidth/2 - svg_padding + "px";
            }
            if (yswap) {
                svg.style.top = e.clientY - cumulativeOffset(knob).top - svg_padding + "px";
            } else {
                svg.style.top = knob.clientHeight/2 - svg_padding + "px";
            }
            let offset = cumulativeOffset(tmp);
            let a = Math.abs(e.clientX - offset.left - tmp.clientWidth);
            let b = Math.abs(e.clientY - offset.top - tmp.clientHeight/2);
            path.setAttribute("d", `M ${svg_padding} ${svg_padding} C ${(a+svg_padding)/2} 0 ${(a+svg_padding)/2} ${b} ${a} ${b}`);
            if (!both) {
                if (xswap) {
                    path.setAttribute("d", `M ${svg_padding} ${b} C ${a/2} ${b} ${a/2} ${svg_padding} ${a+svg_padding} ${svg_padding}`);
                }
                if (yswap) {
                    path.setAttribute("d", `M ${svg_padding} ${b} C ${a/2} ${b} ${a/2} ${svg_padding} ${a} ${svg_padding}`);
                }
            }
            svg.setAttribute("width", (path.getBoundingClientRect().width + svg_padding*2).toString());
            svg.setAttribute("height", (path.getBoundingClientRect().height + svg_padding*2).toString());
        }
        tmp.querySelector(".connector").addEventListener("mousedown", () => {
            document.addEventListener("mousemove", updateConnection);
            svg.style.display = "block";
        });
        document.addEventListener("mouseup", () => {
            svg.style.display = "none";
            svg.setAttribute("width", "0");
            svg.setAttribute("height", "0");
        });
        this.element = tmp;
    }

    updateConnections() {
        //
    }

    getElement() {
        return this.element;
    }
}

class IconButton extends AudioGraphNodeComponent {

    element: HTMLElement;

    constructor(icon:string, onclick:any) {
        super();
        // TODO any type
        let tmp = createElement(nodeComponents["iconbutton"]);
        tmp.innerHTML = icon;
        tmp.addEventListener("click", onclick);
        this.element = tmp;
    }

    getElement() {
        return this.element;
    }

    changeIcon(newicon:string) {
        this.element.innerHTML = newicon;
    }
}


class AudioGraphSourceNode extends AudioGraphNode {

    is_playing: boolean;
    source: Source;
    sample: AudioBufferSourceNode;

    constructor(source: Source) {
        super();
        this.is_playing = false;
        this.source = source;
        this.sample = null;
        this.setTitle(source.filename);
    }

    initComponents() {
        this.addComponent(new Output("outoput"));
        this.addComponent(new Stat("length", "12s"));
        let playbutton = new IconButton('<i class="fa-solid fa-play"></i>', () => {
            // change the icon according to the play state
            this.is_playing = !this.is_playing;
            if (this.is_playing) {
                playbutton.changeIcon('<i class="fa-solid fa-pause"></i>');
                this.play();
            } else {
                playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
                this.pause();
            }
        });
        this.addComponent(playbutton);
    }

    play() {
        this.sample = globals.audiocontext.createBufferSource();
        this.sample.buffer = this.source.getAudioBuffer();
        this.sample.connect(globals.audiocontext.destination);
        this.sample.start();
    }

    pause() {
        this.sample.stop();
    }
}

class AudioGraphOutputNode extends AudioGraphNode {
    constructor() {
        super();
        this.setTitle("Output 1");
    }

    initComponents() {
        this.addComponent(new Input("inputo"));
        this.addComponent(new Stat("channels", "2"));
    }
}

class Connection {
    constructor(output: any, input: any) {
        // both parameters are I/O elements
    }
}

// add initial nodes to screen
let source = new Source("./files/0Current project/kick7.1.wav");
let nodeee = new AudioGraphSourceNode(source);
let outpotu = new AudioGraphOutputNode();

// initialize screen drag listener
function screendrag(e: MouseEvent) {
    nodes.forEach(element => {
        let tmp = element.element;
        tmp.style.left = tmp.offsetLeft + e.movementX + "px";
        tmp.style.top = tmp.offsetTop + e.movementY + "px";
    });
}
document.addEventListener("mousedown", (e) => {
    if (e.button === 1) {
        document.addEventListener("mousemove", screendrag);
    }
});
document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", screendrag);
});