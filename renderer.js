//const Speaker = require("speaker");
//var {Howl, Howler} = require("howler");


var framerate = 44100;

var track_length = 500; // in s
function length_in_beats() {return track_length/60*bpm;}
function length_in_px() {return length_in_beats()*xsnap;}
function progress_in_percent() {return cursor_pos/length_in_px();}

// contains the currently dragged element
var current_drag_element = null;

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

// add event listeners to all toggle buttons
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


// add event listeners to bars-bar
var top_bar = document.getElementById("tracks_top_bar_inner");
var top_bar_bars = document.querySelector(".tracks_top_bar_bars");
function bars_cursor_move_listener(e) {
  if (e.clientX - cumulativeOffset(top_bar).left <= 0) {cursor.style.left = -10; return;}
  var newX = e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft;
  cursor.style.left = newX;
  cursor_pos = newX;
  current_time = pixels_to_ms(newX);
  track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + cursor_pos + bars.scrollLeft + 97 + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
}
top_bar_bars.addEventListener("mousedown", (e) => {
  cursor.style.left = e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft;
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

//let items = ["test1", "test2", "test3", "[spacer]", "test4"];
//let listeners = [() => {alert("test1")}, () => {alert("test2")}, () => {alert("test3")}, () => {alert("test4")}];
//let test = new ContextMenu(items, listeners);