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

// track canvas
(function() {
    var c = document.getElementById("track_canvas");
    var ctx = c.getContext("2d");
    ctx.translate(0.5, 0.5);

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
})();

// header buttons
document.querySelectorAll(".header_button").forEach(button => {
  button.classList.add("unclicked");
  button.addEventListener("click", () => {
    var icon = button.firstChild;
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
/*
document.getElementById("button").classList.add("unclicked");
document.getElementById("button").addEventListener('click', () => {
  var button = document.getElementById("button");
  var icon = document.querySelector("#button > i");
  if (button.classList.contains("clicked")){
    button.classList.remove("clicked");
    button.classList.add("unclicked");
    icon.style.color = 'rgb(225, 225, 225)';
  } else {
    button.classList.remove("unclicked");
    button.classList.add("clicked");
    icon.style.color = 'rgb(80, 19, 0)';
  }
});*/

// sidebar resizing 
var resizing_sidebar = false;
var resizing_track = false;

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

  document.onmouseup = function(e) {
    // stop resizing
    resizing_sidebar = false;
  }
})();
(function() {
  var container = document.getElementById("tracks"),
    content = document.getElementById("track_wrap"),
    handle = document.getElementById("track_resize");

  handle.onmousedown = function(e) {
    resizing_track = true;
    return false;
  };

  document.getElementById("main_content").onmousemove = function(e) {
    // we don't want to do anything if we aren't resizing.
    if (!resizing_track) {
      return;
    }

    var offsetTop = container.clientHeight - (e.clientY - container.offsetTop);

    content.style.height = container.clientHeight - offsetTop + "px";
    //right.style.height = offsetTop + "px";

    return false;
  }

  document.getElementById("main_content").onmouseup = function(e) {
    // stop resizing
    resizing_track = false;
  }
})();