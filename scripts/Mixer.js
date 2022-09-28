var channel_element = ' <div class="channel">\
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

// repeat channels
let mixer_channels = document.querySelector(".mixer_channels_wrapper");
for (let i = 0; i < 60; i++) {
    let a = document.createElement("div");
    a.innerHTML = channel_element;
    a.querySelector(".index_indicator > p").innerHTML = i;
    a.querySelector(".channel_label > p").innerHTML = "Insert " + i;
    mixer_channels.appendChild(a.firstElementChild);
}