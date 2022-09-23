//
// tracks scrolling
//
var track_width = 0;
var current_track_scroll_percent = 0;
var bars = document.querySelector(".tracks_top_bar_bars_wrapper");
var track_view = document.getElementById("tracks");
function tracks_scroll_by_px(pixelX, pixelY) {
  track_width = tracks[0].content.querySelector(".track_background").clientWidth - tracks[0].content.clientWidth;
  tracks.forEach(t => {
    t.content.scrollBy({left: pixelX});
  });
  var percent = tracks[0].content.scrollLeft / track_width;
  bars_scrollbar_handle.style.left = (20 + maxX * percent) + "px";

  bars.scrollBy({left: pixelX});
  bars.scrollLeft = Math.min(bars.scrollLeft, track_width);
  track_view.scrollBy({top: pixelY});
}
function tracks_scroll_to(percentX, percentY) {
  current_track_scroll_percent = percentX;
  track_width = tracks[0].content.querySelector(".track_background").clientWidth - tracks[0].content.clientWidth;
  maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
  tracks.forEach(t => {
    t.content.scrollTo({top: percentY, left: percentX*track_width});
  });
  bars.scrollTo({left: percentX*track_width});
  bars_scrollbar_handle.style.left = (20 + maxX * percentX) + "px";
}
var drag_mouse_down_pos_x = 0;
var drag_mouse_down_pos_y = 0;
var wheel_down = false;
var delta_delta_x = 0;
var delta_delta_y = 0;
track_view.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.button === 1) {
    drag_mouse_down_pos_x = e.clientX;
    drag_mouse_down_pos_y = e.clientY;
    wheel_down = true;
  }
});
document.addEventListener("mouseup", () => {wheel_down = false;delta_delta_x = 0;delta_delta_y = 0;});
track_view.addEventListener("mousemove", (e) => {
  if (wheel_down) {
    var deltaX = drag_mouse_down_pos_x - e.clientX;
    var deltaY = drag_mouse_down_pos_y - e.clientY;
    tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
    delta_delta_x = deltaX;
    delta_delta_y = deltaY;
  }
});

/*
 *     ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗    ███╗   ███╗███████╗███╗   ██╗██╗   ██╗
 *    ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝    ████╗ ████║██╔════╝████╗  ██║██║   ██║
 *    ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║       ██╔████╔██║█████╗  ██╔██╗ ██║██║   ██║
 *    ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║       ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║
 *    ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║       ██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝
 *     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ 
 *  
 *    hide/show the context menu
 *    listeners
 *    etc.
 */
let track_config_menu = document.getElementById("track_config_menu");
let track_config_xoffset = 0;
let track_config_yoffset = 0;
function track_config_movement(e) {
  track_config_menu.style.left = e.clientX - track_config_xoffset + "px";
  track_config_menu.style.top = e.clientY - track_config_yoffset + "px";
}
track_config_menu.addEventListener("mousedown", (e) => {
  if (e.target != track_config_menu) return;
  track_config_xoffset = e.clientX - track_config_menu.offsetLeft;
  track_config_yoffset = e.clientY - track_config_menu.offsetTop;
  document.addEventListener("mousemove", track_config_movement);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", track_config_movement);
});
track_config_menu.querySelector("#conf_check").addEventListener("click", () => {
  current_context_track.setTitle(track_config_menu.querySelector("#conf_name_input").value);
  track_config_menu.style.display = "none";
  deactivate_space_to_play = false;
});
track_config_menu.querySelector("#conf_xmark").addEventListener("click", () => {
  track_config_menu.style.display = "none";
  deactivate_space_to_play = false;
});
function showTrackConfig(e) {
  toggle_track_context_menu();
  
  track_config_menu.querySelector("#conf_bottom p").innerText = current_context_track.title;
  
  track_config_menu.style.left = e.clientX + "px";
  track_config_menu.style.top = e.clientY + "px";
  track_config_menu.style.display = "flex";
  
  deactivate_space_to_play = true;
  track_config_menu.querySelector("#conf_name_input").value = current_context_track.title;
}

// context menu disappear
let context_menu = document.getElementById("track_context_menu");
let color_picker_menu = document.getElementById("color_picker");
let current_context_track = null; // this will be set when the context menu is opened on one track (to the given track)
let track_context_items = context_menu.querySelectorAll(".context_item");
function toggle_track_context_menu(e, track) {
  if (e === undefined) {
    context_menu.style.display = "none";
  } else {
    context_menu.style.left = e.clientX + "px";
    context_menu.style.top = e.clientY + "px";
    context_menu.style.display = "block";
    current_context_track = track;
  }
}
document.querySelector("body").addEventListener("click", (e) => {
  if (e.target.offsetParent != context_menu) {
    toggle_track_context_menu();
  }
});
for (let i = 0; i < track_context_items.length; i++) {
  switch (i) {
    case 0:
      track_context_items[i].addEventListener("click", (e) => {
        showTrackConfig(e);
      });
      break;
    case 1:
      track_context_items[i].addEventListener("click", (e) => {
        toggle_track_context_menu();
        color_picker.style.display = "block";
      });
      break;
  
    default:
      break;
  }
}


/*
 *    ████████╗██████╗  █████╗  ██████╗██╗  ██╗
 *    ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
 *       ██║   ██████╔╝███████║██║     █████╔╝ 
 *       ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
 *       ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
 *       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 * 
 *    class definition
 */
function pixels_to_frames(px) {return (44100 * (60 / bpm)) / (xsnap*4/8) * px;}
class Track {
    constructor () {
      this.samples = [];
      this.temp_samples = [];
      this.hover_buffer = null;
      this.color = null;
      this.title = "";
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
     console.log(this.buffer_position);
     console.log(this.data.slice(this.buffer_position - size, this.buffer_position));
     return this.data.slice(this.buffer_position - size, this.buffer_position);
    }
  
    enable() {
      this.enabled = true;
      this.radio_btn.firstElementChild.style.backgroundColor = green;
      this.description.style.backgroundColor = this.color.color;
      this.description.style.color = "";
      this.description.style.borderRightColor = this.color.lighten(10);
      this.description.style.background = this.color.color;
    }
  
    disable() {
      this.enabled = false;
      this.radio_btn.firstElementChild.style.backgroundColor = grey;
      this.description.style.backgroundColor = this.color.darken(20);
      this.description.style.color = "#ffffff45";
      this.description.style.borderRightColor = this.color.darken(20);
      this.description.style.borderLeftColor = this.color.darken(20);
      this.description.style.background = "repeating-linear-gradient(45deg, transparent, transparent 2px, #0000000a 2px, #0000000a 4px) " + this.color.darken(20);
    }
  
    updateData() {
      // function that writes the frame data to the track's audio array
      for (let i = 0; i < this.samples.length; i++) {
        let s = this.samples[i];
        let d = s.data;
        let offset = pixels_to_frames(s.x);
        for (let j = 0; j < d.length; j++) {
          this.data[j+offset] = d[j];
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
      resize_handle.onmousedown = function() {
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
      this.element.addEventListener("mouseenter", () => {
        // help
        header_help_text.innerHTML = this.title;
        
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
          let newnewX = newX - newX % xsnap;
          this.hover_buffer.element.style["left"] = newnewX + "px";
          this.hover_buffer.x = newnewX;
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
  
      // context menu
      this.description.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        current_context_track = this;
        toggle_track_context_menu(e, this);
      });
    }
  
    setTitle(title) {
      this.element.querySelector("#track_title").innerHTML = title;
      this.title = title;
    }
  
    setColor(color) {
      this.color = color;
      this.description.style.background = this.color.color;
      this.description.style.borderColor = this.color.darken(8) + " " + this.color.lighten(10);
      this.samples.forEach(s => {
        s.setColor(color);
      });
    }
  
    addSample(sample) {
      // parameter is of type TrackSample
      //sample.x = sample.element.offsetLeft;
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
  