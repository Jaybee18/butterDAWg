var fs = require("fs");

var help_text = document.getElementById("header_help_text");
var xsnap = 20;

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

    this.element.addEventListener("mouseleave", () => {
      this.temp_samples.forEach(elmnt => {
        elmnt.element.remove();
      });
      this.temp_samples = [];
    });
  }

  initializeEventListeners() {
    this.element.addEventListener("mouseenter", (e) => {
      // help
      header_help_text.innerHTML = "Track " + this.id;
    });
    
    this.element.addEventListener("mousemove", (e) => {
      // move all the objects in this.temp_samples
      this.temp_samples.forEach(s => {
        var newX = e.clientX - cumulativeOffset(s.element.parentElement).left - s.element.clientWidth/2;
        newX = Math.min(Math.max(newX, 0), this.content.clientWidth);
        s.element.style["left"] = newX-newX%xsnap + "px";
      });
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

  sampleHover(sample) {
    // call this function of a track, when currently dragging a sample
    // from the sidebar, to display a track_sample representation of
    // the sample on the track at the current position of the mouse
    var t = new TrackSample(sample);
    if (this.temp_samples.length >= 1) {return;}
    this.content.appendChild(t.element);
    this.temp_samples.push(t);
  }
}

class SidebarItem {
  constructor (title) {
    // construct own element
    var template = document.getElementById("sample_template");
    var clone = template.content.cloneNode(true);
    this.title = title;

    // add to sidebar
    var sidebar = document.getElementById("sidebar");
    sidebar.insertBefore(clone, document.getElementById("sample_add"));
    this.element = sidebar.children[sidebar.childElementCount-2].firstElementChild;
    this.id = Date.now().toString();
    this.element.id = this.id;

    // add functionality
    dragSample(this);
  }
}

class TrackSample {
  constructor () {
    this.width = 200;
    this.title = "Sample";
    this.data = [1, 2, 3, 4, 5];

    // construct own element
    var template = document.getElementById("track_sample_object");
    var clone = template.content.cloneNode(true);
    this.element = clone.querySelector(".track_object");
    this.element.querySelector(".track_object_label > p").innerText = this.title;
    this.element.style.width = this.width + "px";
    this.id = Date.now().toString();
    this.element.id = this.id;

    dragElement(this.element);
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.element.addEventListener("mouseenter", () => {
      // help
      header_help_text.innerHTML = "Sample " + this.id;
    });
  }
}

// add track-button functionality
document.getElementById("track_add_label").addEventListener('click', () => {new Track();});

document.addEventListener("mouseup", () => {
  resizing_track = null;
});

//document.getElementById("sample_add_label").addEventListener("click", () => {new SidebarItem();});

// function for dragging samples
// from https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt) {
  var deltaX = 0, pos2 = 0, oldX = 0, oldY = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    oldX = e.clientX;
    oldY = e.clientY;
    document.addEventListener("mouseup", closeDragElement);
    // call a function whenever the cursor moves:
    document.addEventListener("mousemove", elementDrag);
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // determine the track the current object should be a child of
    t = currently_hovered_track();
    if (t !== null) {
      // snap to currently hovered track, if present
      var content = t.querySelector(".track_content");
      content.appendChild(elmnt);
    } else {
      return;
    }

    // calculate the new cursor position:
    var mouseX = e.clientX;
    deltaX = oldX - mouseX;
    if (Math.abs(deltaX) < xsnap) {
      return;
    }
    deltaX -= deltaX%xsnap;

    oldY = e.clientY;
    if (e.clientX < content.getBoundingClientRect().left) {
      oldX = content.getBoundingClientRect().left;
    } else {
      oldX = e.clientX;
    }
    // set the element's new position:
    var newX = (elmnt.offsetLeft - deltaX);
    newX = e.clientX - t.querySelector(".track_content").offsetLeft - t.offsetLeft - elmnt.clientWidth/2; // new tracking system !doesnt snap well to track_content grid
    newX -= newX%xsnap; // nvm; new system now officially better than old system, since it works on absolute cursor positions and not on movement deltas
    if (newX < 0) {
      newX = 0;
    }
    elmnt.style.top = "0px";
    elmnt.style.left = newX + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
  }
}

// sidebar sample drag function
function dragSample(sample) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var startX = 0, startY = 0;

  if (document.getElementById(sample.element.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(sample.element.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    sample.element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    startX = sample.element.offsetLeft;
    startY = sample.element.offsetTop;
    document.addEventListener("mouseup", closeDragElement);
    // call a function whenever the cursor moves:
    document.addEventListener("mousemove", elementDrag);
    sample.element.style.zIndex = "0";
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    sample.element.style.top = (sample.element.offsetTop - pos2) + "px";
    sample.element.style.left = (sample.element.offsetLeft - pos1) + "px";

    // hide the sample object and show the preview of the track sample object
    var t = currently_hovered_track();
    if (t === null) {sample.element.style["opacity"] = "1"; return;}
    sample.element.style["opacity"] = "0";
    t.sampleHover(sample);
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
    resetSamplePos(sample.element, startX, startY);
  }
}

// sample object position reset animation
var steps = 50;
var interval_id = null;
function resetSamplePos(elmnt, toX, toY) {
  var top = elmnt.offsetTop;
  var left = elmnt.offsetLeft;
  var xstep = (toX - left)/steps, ystep = (toY - top)/steps;
  clearInterval(interval_id);
  id = setInterval(frame, 1);
  function frame() {
    if (Math.abs(top-toY) < 1 && Math.abs(left-toX) < 1) {
      clearInterval(id);
      elmnt.style.top = toY;
      elmnt.style.left = toX;
      elmnt.style.zIndex = "0";
      elmnt.style.opacity = "1.0";
    } else {
      top += ystep;
      left += xstep;
      elmnt.style.top = top + "px";
      elmnt.style.left = left + "px";
    }
  }
}



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
  button.addEventListener("mousedown", () => {
    icon.style.transform = 'scale(1.5)';
  });
  button.addEventListener("mouseup", () => {
    // scale(1.1) because the icon is scaled up by default
    icon.style.transform = 'scale(1.6)'; 
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
    return undefined;
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

    this.contents = contents;
    this.active = false;
    this.indent = indent;
    this.children = [];

    this.initializeEventListeners();
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

// initialize a testing ui
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();