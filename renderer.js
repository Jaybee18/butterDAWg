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
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
    pos1 = pos3 - mouseX;
    if (Math.abs(pos1) < xsnap) {
      return;
    }
    pos1 = pos1 - pos1%xsnap;

    pos4 = e.clientY;
    if (e.clientX < content.getBoundingClientRect().left) {
      pos3 = content.getBoundingClientRect().left;
    } else {
      pos3 = e.clientX;
    }
    // set the element's new position:
    var newX = (elmnt.offsetLeft - pos1);
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
      return;
    }
    elmnt.style.opacity = "0.0";
    var clone_was_null = clone === null;
    if (clone === null) {
      // clone and spawn element
      var template = document.getElementById("track_sample_object");
      clone = template.content.cloneNode(true);
    }
    var content = t.querySelector(".track_content");
    content.appendChild(clone);
    dragElement(content.lastElementChild);
    if (clone_was_null) {
      content.lastElementChild.onmousedown(e);
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