//const { app } = require("electron");

// bpm button functionality
document.getElementById("bpm_add_button").addEventListener('click', () => {
    var label = document.getElementById("bpm_count");
    label.innerHTML = Number.parseInt(label.innerHTML) + 1;
});
document.getElementById("bpm_sub_button").addEventListener('click', () => {
    var label = document.getElementById("bpm_count");
    label.innerHTML = Number.parseInt(label.innerHTML) - 1;
});

// add track-button functionality
var resizing_track = null;
document.getElementById("track_add_label").addEventListener('click', () => {
  // clone and spawn element
  var template = document.getElementById("track_template");
  var clone = template.content.cloneNode(true);
  var tracks = document.getElementById("tracks");
  tracks.insertBefore(clone, document.getElementById("track_add"));

  // draw canvas
  var element = tracks.children[tracks.childElementCount-2];
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

  document.onmouseup = function(e) {
    resizing_track = null;
  };
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
    if (e.clientY < 0 || e.clientY > handling_slider.clientHeight - handle.clientHeight + 1) {
      return;
    }
    handle.style.margin = e.clientY + "px 0px 0px 0px";
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
    icon.style.transform = 'scale(0.8)';
  });
  button.addEventListener("mouseup", () => {
    // scale(1.1) because the icon is scaled up by default
    icon.style.transform = 'scale(1.1)'; 
  });
});

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