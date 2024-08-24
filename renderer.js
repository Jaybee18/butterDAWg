//const Speaker = require("speaker");
//var {Howl, Howler} = require("howler");

// just for VSCode, bc it doesn't automatically clear the 
// debug console after a reload
window.addEventListener("beforeunload", () => {
  console.clear();
});


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


// add event listeners to bars-bar
/*var top_bar = document.getElementById("tracks_top_bar_inner");
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
});*/

// add event listener to bars scrollbar handle
// TODO make a function that can handle scrollbars (bars_cursor, horizontal scrollbars, ...)
/*var bars_scrollbar_handle = document.getElementById("tracks_top_bar_scrollbar_handle");
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
});*/

// (header) song pos slider functionality
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
/*var tools = document.querySelectorAll(".tracks_tool_bar > .tool_button");
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
*/
// initialize a testing ui
/*const Track = require("./built/Track").Track;
const track_count = 10;
for (let i = 0; i < track_count; i++) {
  new Track();
}*/

//let items = ["test1", "test2", "test3", "[spacer]", "test4"];
//let listeners = [() => {alert("test1")}, () => {alert("test2")}, () => {alert("test3")}, () => {alert("test4")}];
//let test = new ContextMenu(items, listeners);