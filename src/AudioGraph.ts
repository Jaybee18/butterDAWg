import { Source } from "./Source";
import { addRadioEventListener, createElement, cumulativeOffset, globals, ms_to_pixels } from "./globals";

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

// base class for every object in the audio graph
abstract class AudioGraphObject {

    protected element: HTMLElement;
    private id: string;

    constructor() {
        this.initElement();

        // make element unique
        this.id = Math.round(Date.now() * Math.random()).toString();
        this.element.id = this.id;

        // add the generated element to the audio graph
        document.getElementById("audiograph").appendChild(this.element);
    }

    remove() {
        document.getElementById(this.id).remove();
    }

    getElement() {
        return this.element;
    }

    // every sublass has to implement this method populating the this.element attribute
    abstract initElement(): void;
}

/*
    ================== Paths =====================
*/
class Connection extends AudioGraphObject {
    
    private path: string;
    private from: Output;
    private to: Input;
    
    constructor(from: Output, to: Input | null) {
        super();
        
        this.from = from;
        this.to = to;

        this.path = "M 0 0 Z";
        let pathobject = this.element.querySelector("path");
        pathobject.setAttribute("d", this.path);

        // connect update function to both nodes' movement update functions
        // to update the path while the nodes are being moved
        // (if the connection is with da mouse, the movement update callback will be
        //  set up by the managing component, because the mouse event is needed as a parameter here)
        if (this.to !== null){
            from.addMoveCallback(() => {this.update();});
            to.addMoveCallback(() => {this.update();});

            this.update();
        }
    }

    initElement() {
        this.element = createElement('<svg><path stroke-linejoin="bevel" stroke-width="2" stroke="#fff" fill="none"></path></svg>');
        this.element.style.position = "absolute";
        this.element.style.pointerEvents = "none";
        this.element.style.filter = "blur(1px)";
    }

    update(e?: {getPosition: () => number[]}) {
        // get the positions of the nodes
        let from_pos = this.from.getPosition();
        let to_pos = this.to === null ? e.getPosition() : this.to.getPosition();

        // calculate connection to the to-node
        let delta = [to_pos[0] - from_pos[0], to_pos[1] - from_pos[1]];
        this.path = `M ${delta[0]<0?Math.abs(delta[0]):0} ${delta[1]<0?Math.abs(delta[1]):0} \
        c ${delta[0]/2} ${0} ${delta[0]/2} ${delta[1]} ${delta[0]} ${delta[1]}`;
        this.element.querySelector("path").setAttribute("d", this.path);

        // offset the svg if necessary && indirectly update the from-position
        let offset = [Math.min(0, delta[0]), Math.min(0, delta[1])]
        this.element.style.left = (from_pos[0] + offset[0]).toString() + "px";
        this.element.style.top = (from_pos[1] + offset[1]).toString() + "px";

        // update the svg's size to match the new dimensions of the graph
        this.element.setAttribute("width", Math.abs(delta[0]).toString() + 10);
        this.element.setAttribute("height", Math.abs(delta[1]).toString() + 10);
    }

    setTo(newTo: Input) {
        this.to = newTo;
        if (newTo !== null) {
            this.to.addMoveCallback(() => {this.update();});
            this.update();
        }
    }
}


/*
    ================== Nodes =====================
*/
let baseNode = '<div class="item">\
                    <div class="item_header">\
                        <p retro="Title">Title</p>\
                    </div>\
                    <div class="item_body"></div>\
                </div>';
abstract class AudioGraphNode extends AudioGraphObject {

    private movementCallbacks: Array<Function>;
    protected components: Array<AudioGraphNodeComponent>;
    protected audio_node: AudioNode;

    constructor(callInitComponents: boolean = true) {
        super();
        this.movementCallbacks = [];
        this.components = [];
        if (callInitComponents)
            this.initComponents();
    }

    initElement() {
        // create the HTML element
        this.element = createElement(baseNode)

        // initialize move listeners
        let header = this.element.querySelector(".item_header");
        let tempthis = this;
        function nodemove(e: MouseEvent) {
            tempthis.element.style.left = tempthis.element.offsetLeft + e.movementX + "px";
            tempthis.element.style.top = tempthis.element.offsetTop + e.movementY + "px";
            tempthis.movementCallbacks.forEach(callback => {callback();});
        }
        header.addEventListener("mousedown", () => {
            // bring to front
            this.element.style.zIndex = "2";
            document.addEventListener("mousemove", nodemove);
        });
        document.addEventListener("mouseup", () => {
            // normalize
            this.element.style.zIndex = "1";
            document.removeEventListener("mousemove", nodemove);
        });
    }

    setTitle(title: string) {
        let a = <HTMLElement> this.element.querySelector(".item_header > p");
        a.setAttribute("retro", title);
        a.innerText = title;
    }

    abstract initComponents(): void;

    connect(to: AudioGraphNode): void {
        this.audio_node.connect(to.getAudioNode());
    }

    getAudioNode() {
        return this.audio_node;
    }

    addComponent(component: AudioGraphNodeComponent) {
        // component of type Node Component
        // aka Output, Input, Stat, ...
        let body = this.element.querySelector(".item_body");
        body.appendChild(component.getElement());
        this.components.push(component);
        return component;
    }

    addMoveCallback(callback: Function) {
        this.movementCallbacks.push(callback);
    }
}

let nodes: Array<AudioGraphNode> = [];
let nodeComponents = {
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


abstract class AudioGraphNodeComponent {

    protected element: HTMLElement;

    constructor(){}

    getElement(): HTMLElement {
        return this.element;
    }
}

class Stat extends AudioGraphNodeComponent {

    private label: string;

    constructor(label:string, value:string) {
        super();
        this.label = label;
        let tmp = createElement(nodeComponents["stat"]);
        let text = label + ": " + value;
        tmp.querySelector("p").setAttribute("retro", text);
        tmp.querySelector("p").innerText = text;
        this.element = tmp;
    }

    setValue(value: string) {
        this.element.querySelector("p").innerText = this.label + ": " + value;
    }
}

// the current input-connector that is being hovered
var currentHoverConnector: Input = null;

class Input extends AudioGraphNodeComponent {

    private parent: AudioGraphNode;

    constructor(parent: AudioGraphNode, label:string) {
        super();
        this.parent = parent;

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

    addMoveCallback(callback: Function) {
        this.parent.addMoveCallback(callback);
    }

    getParent() {
        return this.parent;
    }

    getPosition() {
        let connector = cumulativeOffset(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - 107];
    }
}

class Output extends AudioGraphNodeComponent {

    private parent: AudioGraphNode;

    constructor(parent: AudioGraphNode, label:string) {
        super();
        this.parent = parent;

        let tmp = createElement(nodeComponents["output"]);
        tmp.querySelector("p").setAttribute("retro", label);
        tmp.querySelector("p").innerText = label;
        let tmp_connection: Connection = null;
        let updateConnection = (e: MouseEvent) => {
            // check if in proximity of input-connector
            if (currentHoverConnector !== null) {
                tmp_connection.setTo(currentHoverConnector);
            } else {
                tmp_connection.setTo(null);
            }

            let impostor = {getPosition: () => {
                return [e.clientX - this.parent.getElement().clientWidth + 17, e.clientY - 107 - 9];
            }};
            tmp_connection.update(impostor);
        };
        tmp.querySelector(".connector").addEventListener("mousedown", () => {
            tmp_connection = new Connection(this, null);
            document.addEventListener("mousemove", updateConnection);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", updateConnection);
            if (tmp_connection === null) return;

            // if the mouse is currently hovering over an input connector
            // create a new permanent Connection between these two nodes
            if (currentHoverConnector !== null) {
                new Connection(this, currentHoverConnector);

                // connect the audio nodes
                this.parent.connect(currentHoverConnector.getParent());
            }

            tmp_connection.remove();
            tmp_connection = null;

        });
        this.element = tmp;
    }

    addMoveCallback(callback: Function) {
        this.parent.addMoveCallback(callback);
    }

    getPosition() {
        let connector = cumulativeOffset(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - 107];// - this.parent.getElement().clientHeight + 16 + 10 + 9]; // +9
    }
}

class Indicator extends AudioGraphNodeComponent {
    constructor() {
        super();
        let temp = createElement(nodeComponents["indicator"]);
        this.element = temp;
    }

    setValue(value: number) {
        let lamp = <HTMLElement> this.element.querySelector(".lamp");
        lamp.style.backgroundColor = "#00ff00" + value.toString(16).padStart(2, "0");
    }
}

class NodeCanvas extends AudioGraphNodeComponent {
    constructor() {
        super();
        let tmp = createElement(nodeComponents["canvas"]);

        let c = <HTMLCanvasElement> tmp.querySelector("canvas");
        c.width = 180;
        let ctx = c.getContext("2d");
        let cwidth = c.width;
        let cheight = c.height;
        ctx.fillStyle = "#3f484d";
        ctx.fillRect(0, 0, cwidth, cheight);

        this.element = tmp;
    }

    getCanvas() {
        return (<HTMLCanvasElement> this.element.querySelector("canvas"))
    }

    clear() {
        let c = this.element.querySelector("canvas");
        let ctx = c.getContext("2d");
        ctx.fillRect(0, 0, c.width, c.height);
    }
}

class Checkbox extends AudioGraphNodeComponent {

    public checked: boolean;
    private changeListener: Function;

    constructor() {
        super();
        let tmp = createElement(nodeComponents["checkbox"]);
        this.checked = false;

        let radio_btn = tmp.querySelector(".radio_btn");
        let radio_btn_green = <HTMLElement> radio_btn.querySelector(".radio_btn_green");
        radio_btn_green.style.backgroundColor = globals.grey;
        radio_btn.addEventListener("click", () => {
            this.checked = !this.checked;
            radio_btn_green.style.backgroundColor = this.checked ? globals.green : globals.grey;
            this.changeListener();
        });

        this.element = tmp;
    }

    addChangeListener(listener: Function) {
        this.changeListener = listener;
    }
}

class IconButton extends AudioGraphNodeComponent {

    constructor(icon:string, onclick:any) {
        super();
        // TODO any type
        let tmp = createElement(nodeComponents["iconbutton"]);
        tmp.innerHTML = icon;
        tmp.addEventListener("click", onclick);
        this.element = tmp;
    }

    changeIcon(newicon:string) {
        this.element.innerHTML = newicon;
    }
}


class AudioGraphSourceNode extends AudioGraphNode {

    is_playing: boolean;
    source: Source;
    private destination: AudioNode;
    private loop: boolean;

    constructor(source: Source) {
        super(false);
        this.source = source;
        this.is_playing = false;
        this.audio_node = globals.audiocontext.createBufferSource();
        this.setTitle(source.getName());
        this.initComponents();
    }

    initComponents() {
        this.addComponent(new Output(this, "output"));
        this.addComponent(new Stat("length", this.source.getLength().toFixed(2) + "s"));

        let checkbox = new Checkbox();
        checkbox.addChangeListener(() => {
            this.loop = checkbox.checked;
        });
        this.addComponent(checkbox);

        let playbutton = new IconButton('<i class="fa-solid fa-play"></i>', () => {
            // change the icon according to the play state
            if (this.is_playing) {
                playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
                this.pause();
            } else {
                playbutton.changeIcon('<i class="fa-solid fa-pause"></i>');
                this.play();
            }
        });
        this.addComponent(playbutton);
    }

    play() {
        this.audio_node = new AudioBufferSourceNode(globals.audiocontext, {
            buffer: this.source.getAudioBuffer(), 
            loop: this.loop
        });
        //this.audio_node = globals.audiocontext.createBufferSource();
        //(<AudioBufferSourceNode> this.audio_node).buffer = this.source.getAudioBuffer();
        //this.audio_node.connect(globals.audiocontext.destination);
        this.audio_node.connect(this.destination);
        let playbutton: IconButton = null;
        this.components.forEach(component => {
            if (component instanceof IconButton) {
                playbutton = component;
            }
        });
        this.audio_node.addEventListener("ended", (e: Event) => {
            playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
            this.pause();
        });
        (<AudioBufferSourceNode> this.audio_node).start();
        this.is_playing = true;
    }

    connect(to: AudioGraphNode): void {
        this.destination = to.getAudioNode();
    }

    pause() {
        (<AudioBufferSourceNode> this.audio_node).stop();
        this.is_playing = false;
    }

    getOutput(index: number) {
        return <Output> this.components[index];
    }
}

class AudioGraphOutputNode extends AudioGraphNode {
    
    constructor(destination: AudioDestinationNode) {
        super(false);
        this.audio_node = destination;
        this.initComponents();
        this.setTitle("Output 1");
    }
    
    initComponents() {
        this.addComponent(new Input(this, "input"));
        this.addComponent(new Stat("channels", this.audio_node.channelCount.toString()));
    }
    
    getInput(index: number) {
        return <Input> this.components[index];
    }
}

class AudioGraphAnalyzerNode extends AudioGraphNode {

    private indicator: Indicator;
    private canvas: NodeCanvas;

    constructor(){
        super(true);
        this.audio_node = new AnalyserNode(globals.audiocontext);

        this.setTitle("Analyser")

        let temp_this = this;
        const maxY = 150;
        const maxX = 200;
        async function execute1() {
            while (true) {
                await new Promise(resolve => setTimeout(resolve, 10));
                
                (<AnalyserNode> temp_this.audio_node).fftSize = 2**10;
                const bufferLength = (<AnalyserNode> temp_this.audio_node).frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                (<AnalyserNode> temp_this.audio_node).getByteFrequencyData(dataArray);

                let tmp_array: Array<number> = [];
                dataArray.forEach(v => tmp_array.push((1-v/255)*maxY));

                // draw on canvas
                temp_this.canvas.clear();
                let canvas_element = temp_this.canvas.getCanvas();
                let ctx = canvas_element.getContext("2d");
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#fff";
                ctx.beginPath();
                let scale = maxX / Math.log10(bufferLength);
                tmp_array.forEach((v, i) => {
                    ctx.lineTo(Math.log10(i)*scale, v);
                });
                ctx.stroke();
            }
        }
        
        execute1();
    }

    initComponents(): void {
        this.addComponent(new Input(this, "input"));
        this.addComponent(new Output(this, "output"));
        this.canvas = new NodeCanvas();
        this.addComponent(this.canvas);
    }

    setValue(value: number) {
        this.indicator.setValue(value);
    }
}

class PassthroughNode extends AudioGraphNode {
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
}

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

// add initial nodes to screen
let source = new Source("./files/0Current project/kick7.1.wav");
let node1 = new AudioGraphSourceNode(source);
let node2 = new AudioGraphOutputNode(globals.audiocontext.destination);
let node3 = new AudioGraphAnalyzerNode();
let node4 = new PassthroughNode();

// initialize screen drag listener
function screendrag(e: MouseEvent) {
    nodes.forEach(element => {
        let tmp = element.getElement();
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