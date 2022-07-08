//const { app } = require("electron");

function currently_hovered_track() {
  t = null;
  tracklist.forEach(track => {
    if (track.matches(":hover")) {
      t = track;
    }
  });
  return t;
}

// add track-button functionality
var resizing_track = null;
var tracklist = [];
document.getElementById("track_add_label").addEventListener('click', () => {
  // clone and spawn element
  var template = document.getElementById("track_template");
  var clone = template.content.cloneNode(true);
  var tracks = document.getElementById("tracks");
  tracks.insertBefore(clone, document.getElementById("track_add"));

  // draw canvas
  var element = tracks.children[tracks.childElementCount-2];
  tracklist.push(element);
  var c = element.querySelector("#track_canvas");
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

  // add resizing functionality
  var resize_handle = element.querySelector("#track_resize");
  resize_handle.onmousedown = function(e) {
    resizing_track = element;
    return false;
  };

  document.getElementById("tracks").onmousemove = function(e) {
    if (resizing_track === null) {
      return false;
    }

    var new_height = e.clientY - resizing_track.offsetTop;
    resizing_track.style.height = new_height + "px";
  };

  // drag and drop preview selection
  element.addEventListener("mouseenter", () => {
    currently_hoverd_track = element;
  });

  // add description radio button functionality
  addRadioEventListener(element.querySelector(".radio_btn"));
});

document.addEventListener("mouseup", () => {
  resizing_track = null;
});

document.getElementById("tracks").addEventListener("mouseleave", () => {
  // no track is hovered, when the mouse leaves the tracks-area
  currently_hoverd_track = null;
});

// function for adding samples
document.getElementById("sample_add_label").addEventListener("click", () => {
  // clone and spawn element
  var template = document.getElementById("sample_template");
  var clone = template.content.cloneNode(true);
  var sidebar = document.getElementById("sidebar");
  sidebar.insertBefore(clone, document.getElementById("sample_add"));

  var element = sidebar.children[sidebar.childElementCount-2].firstElementChild;
  dragSample(element);
});

// function for dragging samples
// from https://www.w3schools.com/howto/howto_js_draggable.asp
var xsnap = 20;
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
    } else {return;}

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
function dragSample(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var startX = 0, startY = 0;
  var clone = null;
  var clone_id = null;

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
    pos3 = e.clientX;
    pos4 = e.clientY;
    startX = elmnt.offsetLeft;
    startY = elmnt.offsetTop;
    document.addEventListener("mouseup", closeDragElement);
    // call a function whenever the cursor moves:
    document.addEventListener("mousemove", elementDrag);
    elmnt.style.zIndex = "0";
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
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

    // hide the sample object and show the preview of the track sample object
    var t = currently_hovered_track();
    if (t === null) {
      elmnt.style.opacity = "1.0";
      if (clone !== null) {
        document.getElementById(clone_id).remove();
        clone = null;
        clone_id = null;
      }
      return;
    }
    // spawn clone if necessary
    if (clone === null) {
      elmnt.style.opacity = "0.0";
      // clone and spawn element
      var template = document.getElementById("track_sample_object");
      clone = template.content.cloneNode(true);
      var content = t.querySelector(".track_content");
      content.appendChild(clone);
      console.log("added child");
      var c = content.lastElementChild;
      dragElement(c);
      c.onmousedown(e);
      clone_id = Date.now().toString();
      c.id = clone_id;
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
    clone = null;
    resetSamplePos(elmnt, startX, startY);
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
  console.log(bars_scrollbar_wrapper.clientWidth);
  bars_scrollbar_handle.style.left = (e.clientX - cumulativeOffset(bars_scrollbar_wrapper).left - initial_handle_offset) + "px";
  document.addEventListener("mousemove", bars_scrollbar_handle_listener);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", bars_scrollbar_handle_listener);
});

// initialize a testing ui
document.getElementById("track_add_label").click();
document.getElementById("track_add_label").click();