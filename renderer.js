const fs = require("fs");
const wavefile = require("wavefile");
const Speaker = require("speaker");

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 44100
});
process.stdin.pipe(speaker, {end: false});

var help_text = document.getElementById("header_help_text");
var xsnap = 20;
var framerate = 44100;

var is_playing = false;
var bpm = 150;
var cursor_pos = 0; // in px
var track_length = 500; // in s
function length_in_beats() {return track_length/60*bpm;}
function length_in_px() {return length_in_beats()*xsnap;}
function progress_in_percent() {return cursor_pos/length_in_px();}

// contains the currently dragged element
var current_drag_element = null;

function currently_hovered_track() {
  t = null;
  tracks.forEach(track => {
    if (track.element.matches(":hover")) {
      t = track;
    }
  });
  return t;
}

// tracks scrolling
var track_width = 0;
var current_track_scroll_percent = 0;
function tracks_scroll_by_px(pixelX, pixelY) {
  track_width = tracks[0].content.querySelector(".track_background").clientWidth - tracks[0].content.clientWidth;
  tracks.forEach(t => {
    t.content.scrollBy({left: pixelX});
  });
  var percent = tracks[0].content.scrollLeft / track_width;
  bars_scrollbar_handle.style.left = (20 + maxX * percent) + "px";

  document.getElementById("tracks").scrollBy({top: pixelY});
}
function tracks_scroll_to(percentX, percentY) {
  current_track_scroll_percent = percentX;
  track_width = tracks[0].content.querySelector(".track_background").clientWidth - tracks[0].content.clientWidth;
  maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
  tracks.forEach(t => {
    t.content.scrollTo({top: percentY, left: percentX*track_width});
  });
  top_bar_bars.scrollTo({top: percentY, left: percentX*track_width});
  bars_scrollbar_handle.style.left = (20 + maxX * percentX) + "px";
}
var drag_mouse_down_pos_x = 0;
var drag_mouse_down_pos_y = 0;
var wheel_down = false;
var delta_delta_x = 0;
var delta_delta_y = 0;
document.getElementById("tracks").addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.button === 1) {
    drag_mouse_down_pos_x = e.clientX;
    drag_mouse_down_pos_y = e.clientY;
    wheel_down = true;
  }
});
document.addEventListener("mouseup", () => {wheel_down = false;delta_delta_x = 0;delta_delta_y = 0;});
document.getElementById("tracks").addEventListener("mousemove", (e) => {
  if (wheel_down) {
    var deltaX = drag_mouse_down_pos_x - e.clientX;
    var deltaY = drag_mouse_down_pos_y - e.clientY;
    tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
    delta_delta_x = deltaX;
    delta_delta_y = deltaY;
  }
});

// palette functionality
// TODO event listeners setup may be a bit inefficient
var palette = document.querySelector(".palette");
var palette_current_scope = 0;
var palette_current_element = null; /* current selected object to paint on tracks */
var palette_content = [[], [], []]; // list of lists of 'Item's
var scopes = document.querySelectorAll(".palette_scope > .tool_button");
for (let j = 0; j < 3; j++) {
  scopes[j].style.fill = "#8f979b";
}
scopes[0].style.fill = "#d2d8dc";
for (let i = 0; i < scopes.length; i++) {
  scopes[i].addEventListener("click", () => {
    palette_current_scope = i;
    var content = "";
    palette_content[i].forEach(item => {
      content += '<div class="palette_object">\
                    <i class="fa-solid fa-wave-square"></i>\
                    <p>' + item.title.split(".")[0] + '</p>\
                  </div>';
    });
    palette.innerHTML = content;
    for (let j = 0; j < palette.childElementCount; j++) {
      palette.children[j].addEventListener("click", () => {
        for (let k = 0; k < palette.childElementCount; k++) {
          palette.children[k].style.boxShadow = "";
        }
        palette.children[j].style.boxShadow = "inset 0 0 0 1px #a8e44a";
        palette_current_element = palette_content[i][j];
      });
    }
    for (let j = 0; j < 3; j++) {
      scopes[j].style.fill = "#8f979b";
    }
    scopes[i].style.fill = "#d2d8dc";
  });
}
palette.addEventListener("mouseenter", () => {
  // sample preview
  if (current_drag_element !== null) {
    palette.insertAdjacentHTML("beforeend", '<div class="palette_object" style="opacity: 0.3;">\
                                              <i class="fa-solid fa-wave-square"></i>\
                                              <p>' + current_drag_element.title.split(".")[0] + '</p>\
                                            </div>');
    drag_container.style.display = "none";
  }
});
palette.addEventListener("mouseleave", () => {
  if (current_drag_element !== null) {
    palette.lastChild.remove();
    drag_container.style.display = "block";
  }
});
palette.addEventListener("mouseup", () => {
  if (current_drag_element !== null) {
    var newChild = palette.lastElementChild;
    newChild.style.opacity = "1";
    palette_content[palette_current_scope].push(current_drag_element);
    var index = palette_content[palette_current_scope].length-1;
    newChild.addEventListener("click", () => {
      for (let i = 0; i < palette.childElementCount; i++) {
        palette.children[i].style.boxShadow = "";
      }
      newChild.style.boxShadow = "inset 0 0 0 1px #a8e44a";
      palette_current_element = palette_content[palette_current_scope][index];
    });
  }
});

// event listener for dragging
var drag_container = document.getElementById("drag_container");
document.addEventListener("mousemove", (e) => {
  if (current_drag_element === null) {return;}
  if (!drag_container.hasChildNodes()) {
    var clone = current_drag_element.getDragElement().cloneNode(true);
    drag_container.appendChild(clone);
    drag_container.style.display = "block";
  }
  drag_container.style.left = (e.clientX - drag_container.clientWidth/2) + "px";
  drag_container.style.top = e.clientY + "px";

  // angle container for visual appeal
  drag_container.style.transform = "rotateZ(" + e.movementX + "deg)";
});
document.addEventListener("mouseup", () => {
  if (current_drag_element !== null) {
    drag_container.style.display = "none";
    drag_container.firstChild.remove();
    current_drag_element = null;
  }
});

class Color {
  constructor (hex) {
    this.color = hex;
  }
  static fromRGB(r, g, b) {
    return new Color(r.toString(16), g.toString(16), b.toString(16));
  }
  toRGB() {
    var r = Number.parseInt(this.color.substring(1, 3), 16);
    var g = Number.parseInt(this.color.substring(3, 5), 16);
    var b = Number.parseInt(this.color.substring(5, 7), 16);
    return [r, g, b];
  }
  toRGBString() {
    var values = this.toRGB();
    return "rgb(" + values[0] + "," + values[1] + "," + values[2] + ")";
  }
  darken(magnitude) {
    // magnitude = value from 0 to 255
    var values = this.toRGB();
    var a = values.map((v) => {return Math.max(v - magnitude, 0).toString(16).padStart(2, "0");});
    return "#" + a[0] + a[1] + a[2];
  }
  lighten(magnitude) {
    // magnitude = value from 0 to 255
    var values = this.toRGB();
    var a = values.map((v) => {return Math.min(v + magnitude, 255).toString(16).padStart(2, "0");});
    return "#" + a[0] + a[1] + a[2];
  }
  transparent(magnitude) {
    return this.color + magnitude.toString(16);
  }
}

var tracks = [];
var resizing_track = null;
class Track {
  constructor () {
    this.samples = [];
    this.temp_samples = [];
    this.hover_buffer = null;
    this.color = null;
    this.data = new Array(400*44100);
    this.buffer_position = 0;
    this.enabled = true;

    // construct own element
    var template = document.getElementById("track_template");
    var clone = template.content.cloneNode(true);
    
    // add self to track view
    var track_view = document.getElementById("tracks");
    track_view.insertBefore(clone, document.getElementById("track_add"));
    this.element = track_view.children[track_view.childElementCount-2];
    this.id = Date.now().toString();
    this.element.id = this.id;
    
    this.content = this.element.querySelector(".track_content");
    this.description = this.element.querySelector(".description");
    this.sound_indicator = this.element.querySelector(".track_play_indicator");
    this.radio_btn = this.description.querySelector(".radio_btn");
    
    // add self to track-list
    tracks.push(this);
    
    this.setTitle("Track " + tracks.length);
    this.setColor(new Color("#646e73")); // #646e73 #485155
    this.updateCanvas();
    this.initializeResizing();
    this.initializeEventListeners();
  }

  getFrames(size) {
    // == process audio with plugins etc. ==
    /*
    if sum(buffer) > 0:
      this.play_indicator.style.background = white
    */
    this.buffer_position += size;
    return this.data.slice(this.buffer_position - size, this.buffer_position);
  }

  enable() {
    this.enabled = true;
    this.radio_btn.firstElementChild.style.backgroundColor = green;
    this.description.style.backgroundColor = this.color.color;
    this.description.style.color = "";
    this.description.style.borderRightColor = this.color.lighten(10);
  }

  disable() {
    this.enabled = false;
    this.radio_btn.firstElementChild.style.backgroundColor = grey;
    this.description.style.backgroundColor = this.color.darken(20);
    this.description.style.color = "#ffffff45";
    this.description.style.borderRightColor = this.color.darken(20);
  }

  updateData() {
    for (let i = 0; i < this.samples.length; i++) {
      var s = this.samples[i];
      var d = s.data;
      for (let j = 0; j < d.length; j++) {
        this.data[j] = d[j];
      }
    }
  }

  updateCanvas() {
    var background = this.content.querySelector(".track_background");
    var tiles = "";
    for (let i = 0; i < 500; i++) {
      tiles += '<div class="tile" style="background-color:' + (i%32<16 ? "rgb(52, 68, 78)" : "rgb(46, 62, 72)") + ';' + (i%4==0?"border-width: 1px 1px 1px 1.5px":"") + '" ></div>';
    }
    background.innerHTML = tiles;
  }

  _updateCanvas() {
    var c = this.element.querySelector("#track_canvas");
    var ctx = c.getContext("2d");
    for (let i = 0; i < 1000; i+=32) {
      ctx.fillStyle = 'rgb(52, 68, 78)';
      ctx.fillRect(i*xsnap, 0, xsnap*16, 500);
      ctx.fillStyle = 'rgb(46, 62, 72)';
      ctx.fillRect(xsnap*16+i*xsnap, 0, xsnap*16, 500);
    }
    
    ctx.strokeStyle = 'rgb(24, 40, 50)';
    ctx.lineWidth = '10';
    ctx.moveTo(0, 5);
    ctx.lineTo(xsnap*1000, 5);
    ctx.stroke();

    //ctx.strokeStyle = 'rgb(0, 0, 0, 0.3)';
    ctx.lineWidth = '1';
    for (let i = 0; i < 1000; i++) {
        ctx.moveTo(i*20, 0);
        ctx.lineTo(i*20, 500);
    }
    ctx.stroke();
  }

  initializeResizing() {
    // TODO maybe optimize this
    var resize_handle = this.element.querySelector("#track_resize");
    var l = this.element;
    resize_handle.onmousedown = function(e) {
      resizing_track = l;
      return false;
    };

    document.getElementById("tracks").onmousemove = function(e) {
      if (resizing_track === null) {
        return false;
      }

      var new_height = e.clientY - cumulativeOffset(resizing_track).top; //resizing_track.offsetTop;
      resizing_track.style.height = new_height + "px";
    };

  }

  resizeBackground(event) {
    var background = this.content.querySelector(".track_background");
    background.style.width = background.clientWidth - event.deltaY*5 + "px";
    for (let i = 0; i < this.samples.length; i++) {
      this.samples[i].resize();
      var previousXsnap = xsnap + event.deltaY/100; // as of the formula below
      this.samples[i].move(this.samples[i].element.offsetLeft/previousXsnap * (-event.deltaY/100), 0);
    }
  }

  resizeHeight(delta) {
    this.element.style.height = this.element.clientHeight - delta + "px";
  }
  
  initializeEventListeners() {
    this.element.addEventListener("mouseenter", (e) => {
      // help
      header_help_text.innerHTML = "Track " + this.id;
      
    });

    this.content.addEventListener("wheel", (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        // idk how else to do it, this just transfers the scroll event
        // to the scrollbar_handle
        var currentOffset = (bars_scrollbar_handle.offsetLeft - 20) / maxX;
        var newOffset = currentOffset + (e.deltaY/100)/50;
        newOffset = Math.min(Math.max(newOffset, 0), 1);
        tracks_scroll_to(newOffset, 0);
      } else if (control_down) {
        // delta = x*100
        if (xsnap - e.deltaY/100 < 6) {return;} // TODO this may cause some issues in the future, but idc
        xsnap -= e.deltaY/100;
        var bars = document.querySelectorAll(".tracks_top_bar_bars > p");
        for (let i = 0; i < bars.length; i++) {
          bars[i].style.width = xsnap*4 + "px";
        }
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].resizeBackground(e);
        }
      } else if (alt_down) {
        e.preventDefault();
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].resizeHeight(e.deltaY/10);
        }
      }
    });

    this.element.addEventListener("mouseleave", () => {
      if (this.hover_buffer !== null) {
        this.hover_buffer.element.remove();
        this.hover_buffer = null;
        drag_container.style.display = "block";
      }
    });
    
    this.content.addEventListener("mousemove", () => {
      // sample preview
      if (current_drag_element !== null) {
        this.sampleHover(current_drag_element);
        drag_container.style.display = "none";
      }
    });
    
    this.element.addEventListener("mousemove", (e) => {
      if (this.hover_buffer !== null) {
        var newX = e.clientX - cumulativeOffset(this.hover_buffer.element.parentElement).left - this.hover_buffer.element.clientWidth/2;
        newX = Math.min(Math.max(newX, 0), this.content.clientWidth) + this.content.scrollLeft;
        this.hover_buffer.element.style["left"] = newX-newX%xsnap + "px";
      }
    });

    this.element.addEventListener("mouseup", (e) => {
      // if a sample was dragged, add it to this track
      if (current_drag_element !== null) {
        this.addSample(this.hover_buffer);
        this.hover_buffer = null;
      }
    });

    // radio button on click
    addRadioEventListener(this.element.querySelector(".radio_btn"), this);
  }

  setTitle(title) {
    this.element.querySelector("#track_title").innerHTML = title;
  }

  setColor(color) {
    this.color = color;
    this.description.style.backgroundColor = this.color.color;
    this.description.style.borderColor = this.color.darken(8) + " " + this.color.lighten(10);
  }

  addSample(sample) {
    // parameter is of type TrackSample
    this.content.appendChild(sample.element);
    this.samples.push(sample);
    this.updateData();
  }

  sampleHover(item) {
    // call this function of a track, when currently dragging a sample
    // from the sidebar, to display a track_sample representation of
    // the sample on the track at the current position of the mouse
    if (this.hover_buffer !== null) {return;}
    var t = new TrackSample(item);
    t.setColor(this.color);
    this.content.appendChild(t.element);
    //t.move(this.content.scrollLeft, 0);
    this.hover_buffer = t;
  }
}

class TrackSample {
  constructor (item) {
    this.title = item.title;
    this.data = item.getData();
    this.item = item;
    this.color = null;
    this.depth_max = item.depth_max;

    // construct own element
    var template = document.getElementById("track_sample_object");
    var clone = template.content.cloneNode(true);
    this.element = clone.querySelector(".track_object");
    this.element.querySelector(".track_object_label > p").innerText = this.title;
    this.id = Date.now().toString();
    this.element.id = this.id;

    this.resize()
    this.drawCanvas(); 
    this.initializeEventListeners();
  }

  move(x, y) {
    this.element.style.left = this.element.offsetLeft + x + "px";
    this.element.style.top = this.element.offsetTop + y + "px";
  }

  resize() {
    // resizes the sample according to the current xsnap value
    this.width = this.item.getDuration()*(bpm/60*xsnap);
    this.element.style.width = this.width + "px";
    this.resizeCanvas(this.width, 200);
  }

  setColor(color) {
    this.color = color;
    this.element.style.backgroundColor = this.color.transparent(77);
    this.element.querySelector(".track_object_label").style.backgroundColor = this.color.color;
  }

  resizeCanvas(width, height) {
    var canvas = this.element.querySelector("canvas");
    canvas.width = width*2;
    canvas.height = 200;
    canvas.style.width = width + "px";
    canvas.style.height = 100 + "px";
    this.drawCanvas();
  }
  
  drawCanvas() {
    var canvas = this.element.querySelector("canvas");

    var c = canvas.getContext("2d");
    c.clearRect(0, 0, canvas.width, canvas.height);
    const dpi = window.devicePixelRatio;
    c.scale(dpi, dpi);
    c.translate(0.5, 0.5);
    c.strokeStyle = "rgb(255, 255, 255)";
    c.lineWidth = "2";
    c.moveTo(0, 100);
    var factor = canvas.width / this.data.length;
    var res = 20;
    for (let i = 0; i < this.data.length; i+=res) {
      /* datapoint * canvas_height + canvas_viewport_height/2 + offset because of title */
      c.lineTo(i*factor, this.data[i]/this.depth_max*55+100+15);
    }
    c.stroke();
  }

  initializeEventListeners() {
    var a = this.element;
    this.element.addEventListener("mouseenter", () => {
      // help
      header_help_text.innerHTML = "Sample " + this.id;
    });

    var oldX = 0;
    var initial_grab_offset = 0;
    function elementDrag(e) {
      e.preventDefault();
      var t = currently_hovered_track();
      if (t !== null) {
        t.content.appendChild(a);
      } else {
        return;
      }
      var deltaX = oldX - e.clientX;
      if (Math.abs(deltaX) < xsnap) {
        return;
      }
      deltaX -= deltaX%xsnap;
      oldX = e.clientX;
      var newX = e.clientX - cumulativeOffset(t.content).left - initial_grab_offset;
      newX -= newX%xsnap;
      newX = Math.max(newX, 0);
      a.style.top = "0px";
      a.style.left = newX + "px";
    }
    this.element.querySelector(".track_object_drag_handle").addEventListener("mousedown", (e) => {
      e.preventDefault();
      oldX = e.clientX;
      initial_grab_offset = e.clientX - cumulativeOffset(a).left;
      document.addEventListener("mousemove", elementDrag);
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", elementDrag);
    });

    var mouse_down_position = 0;
    var mouse_down_width = 0;
    var right_resize = this.element.querySelector(".track_object_resize_right");
    function right_resize_listener(e) {
      e.preventDefault();
      var delta = mouse_down_position - e.clientX;
      delta -= delta%xsnap;
      var newWidth = mouse_down_width - delta;
      a.style.width = newWidth + "px";
    }
    var local = this;
    right_resize.addEventListener("mousedown", (e) => {
      e.preventDefault();
      mouse_down_position = e.clientX;
      mouse_down_width = Number.parseFloat(window.getComputedStyle(local.element).width.replace("px", ""));
      document.addEventListener("mousemove", right_resize_listener);
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", right_resize_listener);
  });
  }
}

// add track-button functionality
document.getElementById("track_add_label").addEventListener('click', () => {new Track();});

document.addEventListener("mouseup", () => {
  resizing_track = null;
});

// add slider functionality
var handling_slider = null;
document.querySelectorAll(".slider").forEach(slider => {
  slider.querySelector(".handle").onmousedown = function(e) {
    handling_slider = slider;
    return false;
  };
  document.addEventListener("mouseup", () => {
    handling_slider = null;
  });
  document.addEventListener("mousemove", (e) => {
    if (handling_slider === null) {
      return;
    }
  
    var handle = handling_slider.querySelector(".handle");
    if (e.clientY < 0 || e.clientY > handling_slider.clientHeight) {
      return;
    }
    handle.style.margin = e.clientY - handling_slider.offsetTop + "px 0px 0px 0px";
  });
});

// header buttons
document.querySelectorAll(".header_button").forEach(button => {
  button.classList.add("unclicked");
  var icon = button.firstChild;
  if (button.classList.contains("header_button_hover")) return;
  button.addEventListener("click", () => {
    if (button.classList.contains("clicked")){
      button.classList.remove("clicked");
      button.classList.add("unclicked");
      icon.style.color = 'rgb(225, 225, 225)';
    } else {
      button.classList.remove("unclicked");
      button.classList.add("clicked");
      icon.style.color = 'rgb(80, 19, 0)';
    }
  });
});

// header controls scope buttons
var scope_pat = document.querySelector(".scope_pat");
var scope_song = document.querySelector(".scope_song");
scope_pat.addEventListener("click", () => {
  if (!scope_pat.classList.contains("scope_pat_clicked")){
    scope_pat.classList.add("scope_pat_clicked");
    scope_song.classList.remove("scope_song_clicked");
  }
});
scope_song.addEventListener("click", () => {
  if (!scope_song.classList.contains("scope_song_clicked")){
    scope_song.classList.add("scope_song_clicked");
    scope_pat.classList.remove("scope_pat_clicked");
  }
});
scope_pat.click();

// sidebar resizing 
var resizing_sidebar = false;

(function() {
  var container = document.getElementById("content"),
    left = document.getElementById("sidebar"),
    right = document.getElementById("main_content"),
    handle = document.getElementById("sidebar_resize");

  handle.onmousedown = function(e) {
    resizing_sidebar = true;
    return false;
  };

  document.onmousemove = function(e) {
    // we don't want to do anything if we aren't resizing.
    if (!resizing_sidebar) {
      return;
    }

    var offsetRight = container.clientWidth - (e.clientX - container.offsetLeft);

    left.style.width = container.clientWidth - offsetRight + "px";
    right.style.width = offsetRight + "px";

    tracks_scroll_to(current_track_scroll_percent);

    return false;
  }

  document.addEventListener("mouseup", () => {
    resizing_sidebar = false;
  });
})();

// canvas size = 200, 100
function updateHeaderWaveview() {
  var canvas = document.getElementById("header_waveview");
  var ctx = canvas.getContext("2d");

  ctx.strokeStyle = "white";
  ctx.moveTo(0, 50);
  ctx.lineTo(200, 50);
  ctx.stroke();
}
updateHeaderWaveview();

// generate bar labels
function drawBarLabels() {
  var bars = document.querySelector(".tracks_top_bar_bars");
  
  for (let i = 0; i < 60; i++) {
    var label = document.createElement("p");
    var font_size = (i%4==0) ? 15 : 10;
    label.style.cssText += "font-size: " + font_size + "px; width: " + xsnap*4 + "px;";
    label.innerHTML = i + 1;
    bars.appendChild(label);
  }
}
drawBarLabels();

// add event listeners to all toggle buttons
var green = "rgb(50, 255, 32)"; // #32ff17
var grey = "rgb(126, 135, 125)"; // #7e877d
function addRadioEventListener(btn, track) {
  var light = btn.querySelector(".radio_btn_green");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.button === 0) {
      var bg = light.style.backgroundColor;
      // the 'or' is bc the property is "" at first, but since the button
      // gets initialized with a green background, it gets treated as "green"
      (bg === green || bg === "") ? track.disable() : track.enable();
    }
  });
  btn.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    var all_tracks_disabled = true;
    tracks.forEach(element => {
      if (element.enabled && element !== track) {all_tracks_disabled = false;}
    });

    if (all_tracks_disabled && track.enabled) {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].enable();
      }
    } else {
      for (let i = 0; i < tracks.length; i++) {
        (tracks[i] !== track) ? tracks[i].disable() : tracks[i].enable();
      }
    }
  });
}
document.querySelectorAll(".radio_btn").forEach(btn => addRadioEventListener(btn)); // probably works, but idk

var cumulativeOffset = function(element) {
  var top = 0, left = 0;
  do {
      top += element.offsetTop  || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
  } while(element);

  return {
      top: top,
      left: left
  };
};

// add event listeners to bars-bar
var cursor = document.getElementById("bars_cursor");
var top_bar = document.getElementById("tracks_top_bar_inner");
var top_bar_bars = document.querySelector(".tracks_top_bar_bars");
function bars_cursor_move_listener(e) {
  if (e.clientX - cumulativeOffset(top_bar).left <= 0) {cursor.style.left = -10; return;}
  var newX = e.clientX - cumulativeOffset(top_bar).left - 10
  cursor.style.left = newX;
  cursor_pos = newX;
  track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + cursor_pos + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
}
top_bar_bars.addEventListener("mousedown", (e) => {
  cursor.style.left = e.clientX - cumulativeOffset(top_bar).left - 10;
  document.addEventListener("mousemove", bars_cursor_move_listener);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", bars_cursor_move_listener);
});

// add event listener to bars scrollbar handle
// TODO make a function that can handle scrollbars (bars_cursor, horizontal scrollbars, ...)
var bars_scrollbar_handle = document.getElementById("tracks_top_bar_scrollbar_handle");
var bars_scrollbar_wrapper = document.querySelector(".tracks_top_bar_scrollbar");
var maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
var initial_handle_offset = 0;
var tracks_scroll_percent = 0;
function bars_scrollbar_handle_listener(e) {
  var newX = e.clientX - cumulativeOffset(bars_scrollbar_wrapper).left - initial_handle_offset - 20;
  newX = Math.min(Math.max(newX, 0), maxX);
  tracks_scroll_percent = newX / maxX;
  tracks_scroll_to(tracks_scroll_percent, 0);
}
bars_scrollbar_handle.addEventListener("mousedown", (e) => {
  initial_handle_offset = e.clientX - cumulativeOffset(bars_scrollbar_handle).left;
  bars_scrollbar_handle.style.left = (e.clientX - cumulativeOffset(bars_scrollbar_wrapper).left - initial_handle_offset) + "px";
  document.addEventListener("mousemove", bars_scrollbar_handle_listener);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", bars_scrollbar_handle_listener);
});

// bpm count drag functionality
var bpm_count = document.querySelector(".bpm");
var bpm_count_text = document.getElementById("bpm_count");
function bpm_drag(e) {
  bpm -= e.movementY/4;
  bpm = Math.max(bpm, 0);
  bpm_count_text.innerHTML = Math.round(bpm);
}
bpm_count.addEventListener("mousedown", () => {
  document.addEventListener("mousemove", bpm_drag);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", bpm_drag);
});

// draggable class for objects that will be draggable
class Draggable {
  initializeDragListener() {
    this.element.addEventListener("mousedown", () => {
      current_drag_element = this;
    });
  }

  getDragElement() {
    throw "Abstract function of Draggable is not implemented";
  }
}

// add sidebar tree functionality
// make a class for sidebar_items that holds which indent level they have
var indent_width = 25;
var sidebar = document.getElementById("sidebar");
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
// fill the sidebartree data
function mapFolder(folder) {
  if (!fs.existsSync(folder)) {return null;}
  // if 'folder' is a file, only return the file
  if (fs.lstatSync(folder).isFile()) {
    if (folder[0] === ".") {return null;}
    return folder;
  }
  // 'folder' is a folder, recursively map the remaining contents
  let res = new Map();
  var filenames = fs.readdirSync(folder);
  filenames.forEach(file => {
    let content = mapFolder(folder + "/" + file);
    if (content !== null) {
      res.set(file, content);
    }
  });
  return res;
}
let hirachy = mapFolder(__dirname + "/files");

var sidebar_folder_colors = { 
  "0Current project": "#aa8070",
  "1Recent files": "#7ca366",
  "2Plugin database": "#6781a4",
  "3Plugin presets": "#8f6080",
  "4Channel presets": "#8f6080",
  "5Mixer presets": "#8f6080",
  "6Scores": "#8f6080",
  "Backup": "#7ca366",
  "Clipboard files": "#6b818d",
  "Demo projects": "#689880",
  "Envelopes": "#6b818d",
  "IL shared data": "#689880",
  "Impulses": "#6b818d",
  "Misc": "#6b818d",
  "My projects": "#689880",
  "Packs": "#6781a4",
  "Project bones": "#aa8070",
  "Recorded": "#6b818d",
  "Rendered": "#6b818d",
  "Sliced audio": "#6b818d",
  "Soundfonts": "#6b818d",
  "Speech": "#689880",
  "Templates": "#689880"
};
class Item extends Draggable{
  constructor (title, contents, indent=0) {
    super();
    this.file = null;
    this.contents = contents;
    this.active = false;
    this.indent = indent;
    this.children = [];
    this.title = title;
    this.depth = null;
    this.depth_type = null;
    this.depth_max = null;

    // construct container
    var a = document.createElement("div");
    a.classList.add("sidebar_item_lvl1");
    var dedicated_color = sidebar_folder_colors[title];
    a.style.color = dedicated_color === undefined ? "var(--bg-light)" : dedicated_color;
    a.style.marginLeft = indent * indent_width + "px";
    this.element = a;
    // add icon
    var ending = title.split(".").pop();
    if (ending === "wav") {
      var type_icon = document.createElement("i");
      type_icon.classList.add("fa-solid");
      type_icon.classList.add("fa-wave-square");
      this.loadData();
      this.initializeDragListener();
    } else if (title === ending) {
      var type_icon = document.createElement("i");
      type_icon.classList.add("fa-regular");
      type_icon.classList.add("fa-folder");
    } else {
      var type_icon = document.createElement("i");
      type_icon.classList.add("fa-solid");
      type_icon.classList.add("fa-file");
    }
    a.appendChild(type_icon);
    // add text object
    var b = document.createElement("div");
    b.classList.add("sidebar_item_lvl1_text");
    b.innerHTML = title;
    a.appendChild(b);

    this.initializeEventListeners();
  }

  loadData() {
    // Load a wav file buffer as a WaveFile object
    this.file = new wavefile.WaveFile(fs.readFileSync(this.contents));
    this.depth = this.file.bitDepth;
    switch (this.depth) {
      case "16":
        this.depth_type = Int16Array;
        this.depth_max = 32767;
        break;
      case "32":
        this.depth_type = Int32Array;
        this.depth_max = 2147483647;
        break;
      case "8":
        this.depth_type = Int8Array;
        this.depth_max = 127;
        break;
      case "32f":
        this.depth_type = Float32Array;
        this.depth_max = 1.0;
        break;
      case "64f":
        this.depth_type = Float64Array;
        this.depth_max = 1.0;
        break;
      default:
        break;
    }
  }

  getData() {
    return this.file.getSamples(true, this.depth_type);
  }

  getWidth() {
    // returns the sample size in frames as an integer
    return this.file.chunkSize;
  }

  getDuration() {
    // returns duration in seconds
    return this.getWidth() / framerate;
  }

  initializeEventListeners() {
    this.element.addEventListener("click", () => {
      if (this.contents === undefined) {return;}
      if (this.active) {
        this.active = false;
        this.close();
      } else {
        this.active = true;
        this.open();
      }
    });
  }

  getDragElement() {
    return this.element.children[1];
  }

  close() {
    if (this.contents === undefined) {
      this.element.remove(); 
      return;
    }
    this.children.forEach(item => {
      item.close();
      item.remove();
    });
    this.children = [];
  }

  open() {
    if (this.contents === undefined) {return;}
    this.contents.forEach((element, key) => {
      var a = new Item(key, element, this.indent+1);
      a.appendAfter(this.element);
      this.children.push(a);
    });
  }

  remove() {
    this.element.remove();
  }

  appendToSidebar() {
    sidebar.appendChild(this.element);
  }

  appendAfter(element) {
    this.element.style.color = element.style.color;
    insertAfter(this.element, element);
  }
}

hirachy.forEach((element, key) => {
  var a = new Item(key, element);
  a.appendToSidebar();
});

// song pos slider functionality
// TODO make more general slider classes, that have onmove functions etc.
var pos_slider_handle = document.querySelector(".handle_h");
function pos_slider_handle_listener(e) {
  var newX = (e.clientX - cumulativeOffset(pos_slider_handle.parentElement).left);
  newX = Math.min(Math.max(newX, 0), pos_slider_handle.parentElement.clientWidth - pos_slider_handle.clientWidth);
  pos_slider_handle.style.left = newX + "px";
}
pos_slider_handle.addEventListener("mousedown", (e) => {
  document.addEventListener("mousemove", pos_slider_handle_listener);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", pos_slider_handle_listener);
});

var interval = null;
// cursor is defined above as the bars_cursor
var track_bar_cursor = document.querySelector(".line_cursor");
var play_button = document.querySelector(".play");
function play() {
  if (is_playing) {
    is_playing = false;
    play_button.innerHTML = "<i class='fa-solid fa-play'></i>";
    track_bar_cursor.style.display = "none";
    clearInterval(interval);
  } else {
    is_playing = true;
    play_button.innerHTML = "<i class='fa-solid fa-pause'></i>";
    // play
    clearInterval(interval);
    interval = setInterval(step, xsnap);
    track_bar_cursor.style.display = "block";
  }
}

// MAIN SOUND GENERATING FUNCTION
// runs once every 'xsnap' ms
/*
44100 frames = 1 sec
882 frames = 0.02 sec = 20 ms
*/
var buffer_size = 1000;
function step() {
  // move cursor
  cursor_pos++;
  cursor.style.left = cursor_pos + "px";
  track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + cursor_pos + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!

  // retrieve sound
  (buffer = []).length = buffer_size;
  buffer.fill(0);
  for (var i = 0; i < tracks.length; i++) {
    var frames = tracks[i].getFrames(buffer_size);
    for (var j = 0; j < buffer_size; j++) {
      buffer[j] += frames[j]===undefined ? 0 : Math.floor(frames[j]/32767*255);
    }
  }
  speaker.write(Buffer.from(buffer), (err) => {console.log(err);});
}

// add key event listeners
var control_down = false;
var alt_down = false;
document.addEventListener("keypress", (e) => {
  if (e.code === "Space") {
    play();
  }
});
document.addEventListener("keydown", (e) => {
  control_down = e.ctrlKey;
  alt_down = e.altKey;
});
document.addEventListener("keyup", (e) => {
  control_down = e.ctrlKey;
  alt_down = e.altKey;
});

// initialize tools listeners
var tools = document.querySelectorAll(".tracks_tool_bar > .tool_button");
var current_active = document.querySelector(".tracks_tool_bar > #tool_pencil > i");
current_active.style.color = "#fcba40";
tools.forEach(btn => {
  var icon = btn.querySelector("i");
  btn.addEventListener("click", () => {
    icon.style.color = window.getComputedStyle(btn).color;
    if (current_active !== null && current_active !== icon) {
      current_active.style.color = "";
    }
    current_active = icon;
  });
});

// initialize a testing ui
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();