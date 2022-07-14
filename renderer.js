var fs = require("fs");
var wavefile = require("wavefile");

var help_text = document.getElementById("header_help_text");
var xsnap = 20;
var framerate = 44100;
const int16max = 32767;

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
  drag_container.style.transform = "rotateZ(" + e.movementX/2 + "deg)";
});
document.addEventListener("mouseup", () => {
  if (current_drag_element !== null) {
    drag_container.style.display = "none";
    drag_container.firstChild.remove();
    current_drag_element = null;
  }
});

var tracks = [];
var resizing_track = null;
class Track {
  constructor () {
    this.samples = [];
    this.temp_samples = [];
    this.hover_buffer = null;

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
    
    // add self to track-list
    tracks.push(this);
    
    this.setTitle("Track " + tracks.length);
    this.setColor(80, 91, 97);
    this.updateCanvas();
    this.initializeResizing();
    this.initializeEventListeners();
  }

  updateCanvas() {
    var c = this.element.querySelector("#track_canvas");
    var ctx = c.getContext("2d");
    ctx.fillStyle = 'rgb(58, 74, 84)';
    for (let i = 0; i < 100; i+=8) {
        ctx.fillRect(i*20, 0, 20*4, 500);
    }
    ctx.strokeStyle = 'rgb(0, 0, 0, 0.3)';
    for (let i = 0; i < 100; i++) {
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

      var new_height = e.clientY - resizing_track.offsetTop;
      resizing_track.style.height = new_height + "px";
    };

  }
  
  initializeEventListeners() {
    this.element.addEventListener("mouseenter", (e) => {
      // help
      header_help_text.innerHTML = "Track " + this.id;
      
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
        newX = Math.min(Math.max(newX, 0), this.content.clientWidth);
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
    addRadioEventListener(this.element.querySelector(".radio_btn"));
  }

  setTitle(title) {
    this.element.querySelector("#track_title").innerHTML = title;
  }

  setColor(r, g, b) {
    var description = this.element.querySelector(".description");
    description.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
    description.style.borderColor = "rgb(" + Math.max(r-10, 0) + ", " + Math.max(g-10, 0) + ", " + Math.max(b-10, 0) + ")";
  }

  addSample(sample) {
    // parameter is of type TrackSample
    this.content.appendChild(sample.element);
    this.samples.push(sample);
  }

  sampleHover(item) {
    // call this function of a track, when currently dragging a sample
    // from the sidebar, to display a track_sample representation of
    // the sample on the track at the current position of the mouse
    if (this.hover_buffer !== null) {return;}
    var t = new TrackSample(item);
    this.content.appendChild(t.element);
    this.hover_buffer = t;
  }
}

class TrackSample {
  constructor (item) {
    this.width = item.getDuration()*(bpm/60*xsnap); // arbitrary number; change later TODO !!
    this.title = item.title;
    this.data = item.getData();

    // construct own element
    var template = document.getElementById("track_sample_object");
    var clone = template.content.cloneNode(true);
    this.element = clone.querySelector(".track_object");
    this.element.querySelector(".track_object_label > p").innerText = this.title;
    this.element.style.width = this.width + "px";
    this.id = Date.now().toString();
    this.element.id = this.id;

    this.resizeCanvas(this.width, 200);
    this.drawCanvas();
    this.initializeEventListeners();
  }

  resizeCanvas(width, height) {
    var canvas = this.element.querySelector("canvas");
    canvas.width = width*2;
    canvas.height = 200;
    canvas.style.width = width + "px";
    canvas.style.height = 100 + "px";
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
      c.lineTo(i*factor, this.data[i]/int16max*80+110);
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
    this.element.querySelector("canvas").addEventListener("mousedown", (e) => {
      oldX = e.clientX;
      initial_grab_offset = e.clientX - cumulativeOffset(a).left;
      document.addEventListener("mousemove", elementDrag);
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", elementDrag);
    });

    var left_resize = this.element.querySelector(".track_object_resize_left");
    var mouse_down_position = 0;
    var mouse_down_width = 0;
    var mouse_down_offset = 0;
    function left_resize_listener(e) {
      e.preventDefault();
      var newWidth = mouse_down_width - (e.clientX - mouse_down_position);
      a.style.width = newWidth + "px";
      a.style.left = mouse_down_offset - (newWidth - mouse_down_width) + "px";
    }
    left_resize.addEventListener("mousedown", (e) => {
      e.preventDefault();
      mouse_down_position = e.clientX;
      mouse_down_width = this.element.clientWidth;
      mouse_down_offset = this.element.offsetLeft;
      document.addEventListener("mousemove", left_resize_listener);
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", left_resize_listener);
  });

    var right_resize = this.element.querySelector(".track_object_resize_right");
    var temp = this;
    function right_resize_listener(e) {
      e.preventDefault();
      var newWidth = mouse_down_width - (mouse_down_position - e.clientX);
      a.style.width = newWidth + "px";
      var canvas = a.querySelector("canvas");
      canvas.style.width = newWidth + "px";
  }
    right_resize.addEventListener("mousedown", (e) => {
      e.preventDefault();
      mouse_down_position = e.clientX;
      mouse_down_width = this.element.clientWidth;
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
  
  for (let i = 0; i < 50; i++) {
    var label = document.createElement("p");
    var font_size = (i%4==0) ? 15 : 10;
    label.style.cssText += "color: rgb(160, 160, 160); margin: 0px; font-size: " + font_size + "px; float: left; width: 40px; height: 100%; display: flex; align-items: self-end; user-select: none;";
    label.innerHTML = i + 1;
    bars.appendChild(label);
  }
}
drawBarLabels();

// add event listeners to all toggle buttons
var green = "rgb(50, 255, 32)"; // #32ff17
var grey = "rgb(126, 135, 125)"; // #7e877d
function addRadioEventListener(btn) {
  var light = btn.querySelector(".radio_btn_green");
  btn.addEventListener("click", () => {
    var bg = light.style.backgroundColor;
    // the 'or' is bc the property is "" at first, but since the button
    // gets initialized with a green background, it gets treated as "green"
    light.style.backgroundColor = (bg === green || bg === "") ? grey : green;
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
var cursor_pos = 0;
var cursor = document.getElementById("bars_cursor");
var top_bar = document.getElementById("tracks_top_bar_inner");
var top_bar_bars = document.querySelector(".tracks_top_bar_bars");
function bars_cursor_move_listener(e) {
  if (e.clientX - cumulativeOffset(top_bar).left <= 0) {cursor.style.left = -10; return;}
  cursor.style.left = e.clientX - cumulativeOffset(top_bar).left - 10;
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
var initial_handle_offset = 0;
function bars_scrollbar_handle_listener(e) {
  var newX = e.clientX - cumulativeOffset(bars_scrollbar_wrapper).left - initial_handle_offset;
  if (newX <= 20) {newX = 20;}
  if (newX >= 1438) { // ik this is hardcoded, but the wrapper_width just kinda dissappears, so fuck you
    newX = 1438;
  }
  bars_scrollbar_handle.style.left = newX + "px";
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
var bpm = 150;
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

var sidebar_folder_colors = { "My projects": "#759b75", 
                              "Project bones": "#ab845b",
                              "Recorded": "#5f748f",
                              "Rendered": "#5f748f",
                              "Sliced audio": "#5f748f" };
class Item extends Draggable{
  constructor (title, contents, indent=0) {
    super();
    this.file = null;
    this.contents = contents;
    this.active = false;
    this.indent = indent;
    this.children = [];
    this.title = title;

    // construct container
    var a = document.createElement("div");
    a.classList.add("sidebar_item_lvl1");
    var dedicated_color = sidebar_folder_colors[title];
    a.style.color = dedicated_color === undefined ? "var(--bg-light)" : dedicated_color;
    a.style.marginLeft = indent * indent_width + "px";
    this.element = a;
    // add icon
    var type_icon = document.createElement("i");
    type_icon.classList.add("fa-solid");
    var ending = title.split(".").pop();
    if (ending === "wav") {
      type_icon.classList.add("fa-wave-square");
      this.loadData();
      this.initializeDragListener();
    } else if (title === ending) {
      type_icon.classList.add("fa-folder");
    } else {
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
  }

  getData() {
    return this.file.getSamples(true, Int16Array);
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

var is_playing = false;
var interval = null;
var progress = 0;
// cursor is defined above as the bars_cursor
var track_bar_cursor = document.querySelector(".line_cursor");
var play_button = document.querySelector(".play");
function play() {
  if (is_playing) {
    is_playing = false;
    play_button.innerHTML = "<i class='fa-solid fa-play'></i>";
    clearInterval(interval);
  } else {
    is_playing = true;
    play_button.innerHTML = "<i class='fa-solid fa-pause'></i>";
    // play
    clearInterval(interval);
    interval = setInterval(move_cursor, xsnap);
    function move_cursor() {
      progress++;
      cursor.style.left = progress + "px";
      track_bar_cursor.style.left = progress + 97 + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
    }
  }
}

document.addEventListener("keypress", (e) => {
  if (e.code === "Space") {
    play();
  }
});

// initialize a testing ui
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();