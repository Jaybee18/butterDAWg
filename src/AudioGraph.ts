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

    abstract initComponents(): void;

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
};


abstract class AudioGraphNodeComponent {

    protected element: HTMLElement;

    constructor(){}

    getElement(): HTMLElement {
        return this.element;
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
}

// the current input-connector that is being hovered
var currentHoverConnector: Input = null;

class Input extends AudioGraphNodeComponent {

    element: HTMLElement;
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

    getPosition() {
        let connector = cumulativeOffset(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - this.parent.getElement().clientHeight + 8];
    }
}

class Output extends AudioGraphNodeComponent {

    element: HTMLElement;
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
                return [e.clientX - this.parent.getElement().clientWidth + 17, e.clientY - this.parent.getElement().clientHeight + 35];
            }};
            tmp_connection.update(impostor);
        };
        tmp.querySelector(".connector").addEventListener("mousedown", () => {
            tmp_connection = new Connection(this, null);
            document.addEventListener("mousemove", updateConnection);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", updateConnection);
            
            // if the mouse is currently hovering over an input connector
            // create a new permanent Connection between these two nodes
            if (currentHoverConnector !== null) {
                new Connection(this, currentHoverConnector);
            }

            if (tmp_connection != null) {
                tmp_connection.remove();
                tmp_connection = null;
            }
        });
        this.element = tmp;
    }

    addMoveCallback(callback: Function) {
        this.parent.addMoveCallback(callback);
    }

    getPosition() {
        let connector = cumulativeOffset(this.element.querySelector(".connector"));
        return [connector.left - this.parent.getElement().clientWidth + 20, connector.top - this.parent.getElement().clientHeight + 35]; // +9
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

    changeIcon(newicon:string) {
        this.element.innerHTML = newicon;
    }
}


class AudioGraphSourceNode extends AudioGraphNode {

    is_playing: boolean;
    source: Source;
    sample: AudioBufferSourceNode;

    constructor(source: Source) {
        super(false);
        this.source = source;
        this.is_playing = false;
        this.sample = null;
        this.setTitle(source.getName());
        this.initComponents();
    }

    initComponents() {
        for(let i = 0; i < this.source.getChannels() + 1; i++) {
            this.addComponent(new Output(this, "channel " + i));
        }
        this.addComponent(new Stat("length", this.source.getLength().toFixed(2) + "s"));
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
        this.sample = globals.audiocontext.createBufferSource();
        this.sample.buffer = this.source.getAudioBuffer();
        this.sample.connect(globals.audiocontext.destination);
        let playbutton: IconButton = null;
        this.components.forEach(component => {
            if (component instanceof IconButton) {
                playbutton = component;
            }
        });
        this.sample.addEventListener("ended", (e: Event) => {
            playbutton.changeIcon('<i class="fa-solid fa-play"></i>');
            this.pause();
        });
        this.sample.start();
        this.is_playing = true;
    }

    pause() {
        this.sample.stop();
        this.is_playing = false;
    }

    getOutput(index: number) {
        return <Output> this.components[index];
    }
}

class AudioGraphOutputNode extends AudioGraphNode {

    private destination: AudioDestinationNode;

    constructor(destination: AudioDestinationNode) {
        super(false);
        this.destination = destination;
        this.initComponents();
        this.setTitle("Output 1");
    }

    initComponents() {
        for(let i = 0; i < this.destination.channelCount; i++) {
            this.addComponent(new Input(this, "channel " + i));
        }
        this.addComponent(new Stat("channels", this.destination.channelCount.toString()));
    }

    getInput(index: number) {
        return <Input> this.components[index];
    }
}

/* Delay Node */
/*
    given a amount of time in seconds, the delay is converted to frames
    with respect to the samplerate. And when an input comes in, it gets
    buffered (buffer has the previously calculated frame size), and for
    the delay time, only frames with value 0 get output
*/

// add initial nodes to screen
let source = new Source("./files/0Current project/kick7.1.wav");
let node1 = new AudioGraphSourceNode(source);
let node2 = new AudioGraphOutputNode(globals.audiocontext.destination);
let node3 = new AudioGraphOutputNode(globals.audiocontext.destination);

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