let screen = document.querySelector(".grid_background");
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
var parab = (x) => {return (0.00001 * warp) * Math.pow(x - 500, 2);};
screen_context.strokeStyle = "#00000000";
screen_context.lineWidth = "2";
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
let agsn = '<div class="item">\
              <div class="item_header">\
                <p retro="Title">Title</p>\
              </div>\
              <div class="item_body">\
                <div class="input">\
                  <div class="connector"></div>\
                  <p retro="Channel 1">Channel 1</p>\
                </div>\
                <div class="output">\
                  <p retro="Output">Output</p>\
                  <div class="connector"></div>\
                </div>\
              </div>\
            </div>';

class AudioGraphSourceNode {
    constructor() {
        this.title = "TestNode"
        this.element = null;
    }

    createElement() {
        let a = createElement(agsn);
        let b = a.querySelector(".item_header > p");
        b.setAttribute("retro", this.title);
        b.innerHTML = this.title;
        this.element = a;
    }

    addToGraph() {
        let a = document.getElementById("audiograph");
        a.appendChild(this.element);
    }

    initializeEventListeners() {
        let header = this.element.querySelector(".item_header");
        function nodemove(e) {
            this.element.style.left = this.element.offsetLeft + e.movementX + "px";
        }
        header.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", nodemove);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", nodemove);
        });
    }
}

let nodeee = new AudioGraphSourceNode();
nodeee.createElement();
nodeee.addToGraph();