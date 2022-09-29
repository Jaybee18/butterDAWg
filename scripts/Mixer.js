const channel_element = ' <div class="channel">\
                            <div class="index_indicator">\
                                <p>20</p>\
                            </div>\
                            <div class="channel_label">\
                                <p>Insert 20</p>\
                            </div>\
                            <div class="channel_volume">\
                                <div class="channel_volume_indicator"></div>\
                                <div class="channel_toggle">\
                                    <div class="channel_toggle_green"></div>\
                                </div>\
                                <div class="channel_pan">\
                                    <div class="channel_pan_knob"></div>\
                                </div>\
                            </div>\
                            <div class="channel_volume_slider">\
                                <div class="channel_volume_knob">\
                                    <div class="channel_volume_knob_peak"></div>\
                                </div>\
                                <div class="channel_volume_background"></div>\
                            </div>\
                            <div class="channel_links"></div>\
                        </div>'

class Channel {
    constructor(index) {
        this.element = null;
        this.index = index;
        this.enabled = true;
        this.pan = 0; // -1.0 to 1.0
        
        // construct element
        this.createElement();
        this.addToMixer();

        this.initializeEventListeners();
    }

    createElement() {
        let a = document.createElement("div");
        a.innerHTML = channel_element;
        let b = a.firstElementChild;
        b.querySelector(".index_indicator > p").innerHTML = this.index;
        b.querySelector(".channel_label > p").innerHTML = "Insert " + this.index;
        this.element = b;
    }

    addToMixer() {
        let mixer = document.querySelector(".mixer_channels_wrapper");
        mixer.appendChild(this.element);
    }

    initializeEventListeners() {
        let volume_slider = this.element.querySelector(".channel_volume_knob");
        let slider_height = this.element.querySelector(".channel_volume_slider").clientHeight;
        let toggle_button = this.element.querySelector(".channel_toggle");
        let toggle_green = this.element.querySelector(".channel_toggle_green");
        let pan_knob = this.element.querySelector(".channel_pan");
        let knob_height = volume_slider.clientHeight;
        volume_slider.style.top = volume_slider.offsetTop/slider_height*100 + "%";
        function slider_move(e) {
            volume_slider.style.top = Math.min(Math.max(volume_slider.offsetTop + e.movementY, 4 - knob_height/2), slider_height - knob_height/2 - 4) + "px";
        }

        volume_slider.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", slider_move);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", slider_move);
            volume_slider.style.top = volume_slider.offsetTop/slider_height*100 + "%";
        });
        toggle_button.addEventListener("click", () => {
            this.enabled = !this.enabled;
            toggle_green.style.backgroundColor = this.enabled?"#5cff5c":"#1a501a";
        });
        let slider = this.element.querySelector(".channel_volume_slider");
        let volume = this.element.querySelector(".channel_volume_indicator");
        this.element.addEventListener("click", (e) => {
            if (e.target !== this.element || e.target !== volume) {return;}
            console.log("test");
        });
        function pan_move(e) {
            this.pan += e.movementX / 10;
            pan_knob.style.background = '#374045 conic-gradient(from 0deg at 50% 50%, #00000000 0%, #00000000 ' + this.pan*100 + '%, #5cff5c ' + this.pan*100 + '%, #5cff5c 100%)'
        }
        pan_knob.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", pan_move);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", pan_move);
        });
    }
}

// repeat channels
for (let i = 0; i < 60; i++) {
    let a = new Channel(i);
    a.addToMixer();
}
