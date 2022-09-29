var current_selected_channel = null;

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
        this.pan = 1; // 0 to 1.0
        this.volume = 100; // in percent
        this.max_volume = 125; // in percent
        this.id = Math.round(Date.now() * Math.random());
        
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
        let c = b.querySelector(".channel_volume_knob");
        c.style.top = "11.4px";
        this.element = b;
    }

    addToMixer() {
        let mixer = document.querySelector(".mixer_channels_wrapper");
        mixer.appendChild(this.element);
    }

    initializeEventListeners() {
        let temp_this = this;
        let volume_slider = this.element.querySelector(".channel_volume_knob");
        let slider_height = this.element.querySelector(".channel_volume_slider").clientHeight;
        let toggle_button = this.element.querySelector(".channel_toggle");
        let toggle_green = this.element.querySelector(".channel_toggle_green");
        let pan_knob = this.element.querySelector(".channel_pan");
        let knob_height = volume_slider.clientHeight;
        function slider_move(e) {
            temp_this.volume = Math.round((1-(volume_slider.offsetTop + 6)/(100 - 13))*100)*1.25;
            header_help_text.innerHTML = "Volume: " + temp_this.volume + "%";
            volume_slider.style.top = Math.min(Math.max(volume_slider.offsetTop + e.movementY, 4 - knob_height/2), slider_height - knob_height/2 - 4) + "px";
        }
        volume_slider.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", slider_move);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", slider_move);
            volume_slider.style.top = volume_slider.offsetTop/slider_height*100 + "%";
        });
        volume_slider.addEventListener("mouseenter", () => {
            header_help_text.innerHTML = "Volume: " + this.volume + "%";
        });
        toggle_button.addEventListener("click", () => {
            this.enabled = !this.enabled;
            toggle_green.style.backgroundColor = this.enabled?"#5cff5c":"#1a501a";
        });
        let volume = this.element.querySelector(".channel_volume_indicator");
        this.element.addEventListener("mousedown", (e) => {
            this.select(true);
        });
        function pan_move(e) {
            temp_this.pan -= e.movementY / 100;
            temp_this.pan = Math.max(Math.min(temp_this.pan, 1.5), 0.5);
            if (temp_this.pan < 1) {
                pan_knob.style["background"] = '#374045 conic-gradient(from 0deg at 50% 50%, #00000000 0%, #00000000 ' + temp_this.pan*100 + '%, #5cff5c ' + temp_this.pan*100 + '%, #5cff5c 100%)';
            } else {
                pan_knob.style["background"] = '#374045 conic-gradient(from 0deg at 50% 50%, #5cff5c 0%, #5cff5c ' + (temp_this.pan-1)*100 + '%, #00000000 ' + (temp_this.pan-1)*100 + '%, #00000000 100%)';
            }

            if (Math.round(temp_this.pan*100) === 100) {
                header_help_text.innerHTML = "Panning: Centered";
            } else {
                header_help_text.innerHTML = "Panning: " + Math.abs(Math.round((temp_this.pan-1)/0.5*100)) + "%" + (temp_this.pan<1?" left":" right");
            }
        }
        pan_knob.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", pan_move);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", pan_move);
        });
        pan_knob.addEventListener("mouseenter", () => {
            if (Math.round(this.pan*100) === 100) {
                header_help_text.innerHTML = "Panning: Centered";
            } else {
                header_help_text.innerHTML = "Panning: " + Math.abs(Math.round((this.pan-1)/0.5*100)) + "%" + (this.pan<1?" left":" right");
            }
        });
    }

    select(selected) {
        let volume = this.element.querySelector(".channel_volume_indicator");
        let indicator = this.element.querySelector(".index_indicator");
        let indicator_text = indicator.querySelector("p");
        if (selected) {
            if (current_selected_channel !== null) {
                current_selected_channel.select(false);
            }
            current_selected_channel = this;
            volume.classList.add("channel_volume_select");
            this.element.style.backgroundColor = "#3d474c";
            this.element.style.borderColor = "#3c464c";
            indicator.style.background = "repeating-linear-gradient(45deg, transparent, transparent 2px, #0000000a 2px, #0000000a 4px) #636c71";
            indicator_text.style.color = "var(--text-color)";
        } else {
            volume.classList.remove("channel_volume_select");
            this.element.style.backgroundColor = "#374045";
            this.element.style.borderColor = "#313a40";
            indicator.style.background = "#636c71";
            indicator_text.style.color = "var(--bg-darker)";
        }
    }
}

// repeat channels
for (let i = 0; i < 60; i++) {
    let a = new Channel(i);
    a.addToMixer();
}