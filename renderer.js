const Speaker = require("speaker");
var {Howl, Howler} = require("howler");


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
  
  for (let i = 0; i < 126; i++) {
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


// add event listeners to bars-bar
var cursor = document.getElementById("bars_cursor");
var top_bar = document.getElementById("tracks_top_bar_inner");
var top_bar_bars = document.querySelector(".tracks_top_bar_bars");
function bars_cursor_move_listener(e) {
  if (e.clientX - cumulativeOffset(top_bar).left <= 0) {cursor.style.left = -10; return;}
  var newX = e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft;
  cursor.style.left = newX;
  cursor_pos = newX;
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

/*
var interval = null;
// cursor is defined above as the bars_cursor
var track_bar_cursor = document.querySelector(".line_cursor");
var play_button = document.querySelector(".play");
var speaker = null;
var stream = null;
function _play() {
  if (is_playing) {
    is_playing = false;
    console.log(test);
    speaker.stop();
    play_button.innerHTML = "<i class='fa-solid fa-play'></i>";
    track_bar_cursor.style.display = "none";
    clearInterval(interval);
  } else {
    is_playing = true;
    play_button.innerHTML = "<i class='fa-solid fa-pause'></i>";
    // create a speaker
    /*speaker = new Howl({
      src: ["sound.wav"],
      ext: ['wav'],
      html5: true,
      autoplay: true
    });
    stream = fs.createWriteStream("./sound.wav");
    //process.stdin.pipe(speaker);
    // play
    clearInterval(interval);
    interval = setInterval(step, 1000);
    track_bar_cursor.style.display = "block";
  }
}

// MAIN SOUND GENERATING FUNCTION
// runs once every 'xsnap' ms
/*
44100 frames = 1 sec
882 frames = 0.02 sec = 20 ms

var buffer_size = 44100;
var test = 0;
function _step() {
  // move cursor
  cursor_pos++;
  /*cursor.style.left = cursor_pos + "px";
  //track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + cursor_pos + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
  track_bar_cursor.style.left = cursor_pos - tracks[0].content.scrollLeft + 97 + "px";
  track_bar_cursor.style.top = track_view.scrollTop + "px";

  // retrieve sound
  (buffer = []).length = buffer_size;
  buffer.fill(0);
  for (var i = 0; i < tracks.length; i++) {
    var frames = tracks[i].getFrames(buffer_size);
    for (var j = 0; j < buffer_size; j++) {
      buffer[j] += frames[j]===undefined ? 0 : Math.floor(frames[j]);
    }
  }
  /*for (let i = 0; i < buffer_size; i++) {
    buffer[i] = Math.floor(Math.random()*32767);
  }
  //buffer = Uint16Array.from(buffer);
  //stream.write(buffer, (err) => {console.log(err);});
  console.log(buffer);
  test++;
  let wav = new WaveFile();
  wav.fromScratch(2, 44100, '16', buffer);
  console.log(wav.toBuffer());
  var file = fs.openSync("./sound.wav", 'w');
  fs.writeFileSync(file, wav.toBuffer());
  speaker = new Howl({
    src: ["sound.wav"]
  });
  speaker.play();
}


var interval = null;
// cursor is defined above as the bars_cursor
var track_bar_cursor = document.querySelector(".line_cursor");
var play_button = document.querySelector(".play");
var speaker = null;
var stream = null;
function __play() {
  if (is_playing) {
    is_playing = false;
    speaker.stop();
    stream.close();
    play_button.innerHTML = "<i class='fa-solid fa-play'></i>";
    track_bar_cursor.style.display = "none";
    clearInterval(interval);
  } else {
    is_playing = true;
    play_button.innerHTML = "<i class='fa-solid fa-pause'></i>";
    // create a speaker
    speaker = new Howl({
      src: ["sound.wav"],
      ext: ['wav'],
      html5: true,
      autoplay: true
    });
    stream = fs.createWriteStream("sound.wav");
    // play
    clearInterval(interval);
    interval = setInterval(step, 1000);
    track_bar_cursor.style.display = "block";
  }
}

// MAIN SOUND GENERATING FUNCTION
// runs once every 'xsnap' ms
44100 frames = 1 sec
882 frames = 0.02 sec = 20 ms

var buffer_size = 44100;
var test = 0;
function __step() {
  // move cursor
  cursor_pos++;
  /*cursor.style.left = cursor_pos + "px";
  //track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + cursor_pos + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
  track_bar_cursor.style.left = cursor_pos - tracks[0].content.scrollLeft + 97 + "px";
  track_bar_cursor.style.top = track_view.scrollTop + "px";

  // retrieve sound
  (buffer = []).length = buffer_size;
  buffer.fill(0);
  for (var i = 0; i < tracks.length; i++) {
    var frames = tracks[i].getFrames(buffer_size);
    for (var j = 0; j < buffer_size; j++) {
      buffer[j] += frames[j]===undefined ? 0 : Math.floor(frames[j]);
    }
  }
  for (let i = 0; i < buffer_size; i++) {
    buffer[i] = Math.floor(Math.random()*255);
  }
  buffer = Uint8Array.from(buffer);
  //stream.write(buffer, (err) => {console.log(err);});
  console.log(buffer);
  test++;
  //let wav = new WaveFile();
  //wav.fromScratch(2, 44100, '16', buffer);
  //console.log(wav.toBuffer());
  //var file = fs.openSync("./sound.wav", 'w');
  //fs.writeFileSync(file, wav.toBuffer());
  stream.write(Buffer.from(buffer));
}*/




// cursor is defined above as the bars_cursor
//var track_bar_cursor = document.querySelector(".line_cursor");
//var play_button = document.querySelector(".play");
//var speaker = null;
//(temp = []).length = 44100;
//for (let i = 0; i < 44100; i++) {temp[i] = Math.floor((Math.random()*2-1)*32767);}
//let wav = new WaveFile();
//wav.fromScratch(2, 44100, '16', [temp, temp]);
//fs.writeFileSync("sound.wav", "");
//let stream = fs.createWriteStream("sound.wav");
//stream.write(wav.toBuffer());
//fs.writeFileSync("sound.wav", wav.toBuffer());
//speaker = new Howl({
  //  src: wav.toBuffer(),
  //  html5: true,
  //});

/*
let interval = null;
const buffer_size = 44100;
let speaker = new Speaker();
let wav = new WaveFile();
let bufferStream = new stream.PassThrough();
bufferStream.pipe(speaker);
//fs.writeFileSync("sound.wav", wav.toBuffer());
function play() {
  if (is_playing) {
    /*speaker.stop();
    stream.end();
    stream.destroy();
    play_button.innerHTML = "<i class='fa-solid fa-play'></i>";
    track_bar_cursor.style.display = "none";
    bufferStream.end();
    clearInterval(interval);
  } else {
    //stream.write(wav.toBuffer(), (err) => {console.log(err)});
    //play_button.innerHTML = "<i class='fa-solid fa-pause'></i>";
    // play
    clearInterval(interval);
    interval = setInterval(step, 500);
    //track_bar_cursor.style.display = "block";
  }
  is_playing = !is_playing;
}

// MAIN SOUND GENERATING FUNCTION
// runs once every 'xsnap' ms
/*
44100 frames = 1 sec
882 frames = 0.02 sec = 20 ms

//var test = 0;
function step() {
  // move cursor
  cursor_pos++;
  /*cursor.style.left = cursor_pos + "px";
  //track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + cursor_pos + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
  track_bar_cursor.style.left = cursor_pos - tracks[0].content.scrollLeft + 97 + "px";
  track_bar_cursor.style.top = track_view.scrollTop + "px";

  // retrieve sound
  (buffer = []).length = buffer_size;
  buffer.fill(0);
  for (var i = 0; i < tracks.length; i++) {
    var frames = tracks[i].getFrames(buffer_size);
    for (var j = 0; j < buffer_size; j++) {
      buffer[j] += frames[j]===undefined ? 0 : Math.floor(frames[j]);
    }
  }
  console.log(buffer);
  wav.fromScratch(2, 44100, '16', buffer);
  bufferStream.write(wav.toBuffer());
}
*/





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