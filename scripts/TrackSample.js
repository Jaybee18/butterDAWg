
class TrackSample {
    constructor (item) {
      this.title = item.title;
      this.data = item.getData();
      this.item = item;
      this.color = null;
      this.depth_max = item.depth_max;
      this.x = 0;
      this.timestamp = 0; // timestep at which this sample is registered in a track

      this.sample_buffer = null;
      this.sample_source = null;
  
      // construct own element
      var template = document.getElementById("track_sample_object");
      var clone = template.content.cloneNode(true);
      this.element = clone.querySelector(".track_object");
      this.element.querySelector(".track_object_label > p").innerText = this.title;
      this.id = Date.now().toString();
      this.element.id = this.id;
  
      this.resize()
      this.drawCanvas(); 
      this.initializeEventListeners();
      this.initializeAudio();
    }
  
    move(x, y) {
      this.element.style.left = this.element.offsetLeft + x + "px";
      this.element.style.top = this.element.offsetTop + y + "px";
      this.x = this.element.offsetLeft + x;
    }
  
    resize() {
      // resizes the sample according to the current xsnap value
      //this.width = this.item.getDuration()*(xsnap*4   /8   *   (bpm/60));
      /*
      44100 frames = 1 sec
      44100 frames = 1000 ms
      1 frame = 1/44100 sec
      1 frame = 0.0022675736961451248 ms


      */
      this.width = this.item.getDuration() * 10000 * ms_to_pixels(1000/sample_rate);
      this.element.style.width = this.width + "px";
      this.resizeCanvas(this.width, 200);
    }
  
    setColor(color) {
      this.color = color;
      this.element.style.backgroundColor = this.color.transparent(77);
      this.element.querySelector(".track_object_label").style.backgroundColor = this.color.color;
    }
  
    resizeCanvas(width, height) {
      var canvas = this.element.querySelector("canvas");
      canvas.width = width*2;
      canvas.height = 200;
      canvas.style.width = width + "px";
      canvas.style.height = 100 + "px";
      this.drawCanvas();
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
        /* datapoint * canvas_height + canvas_viewport_height/2 + offset because of title */
        c.lineTo(i*factor, this.data[i]/this.depth_max*55+100+15);
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
      let temp_this = this;
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
        temp_this.x = newX;
      }
      this.element.querySelector(".track_object_drag_handle").addEventListener("mousedown", (e) => {
        e.preventDefault();
        oldX = e.clientX;
        initial_grab_offset = e.clientX - cumulativeOffset(a).left;
        document.addEventListener("mousemove", elementDrag);
      });
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", elementDrag);
      });
  
      var mouse_down_position = 0;
      var mouse_down_width = 0;
      var right_resize = this.element.querySelector(".track_object_resize_right");
      function right_resize_listener(e) {
        e.preventDefault();
        var delta = mouse_down_position - e.clientX;
        delta -= delta%xsnap;
        var newWidth = mouse_down_width - delta;
        a.style.width = newWidth + "px";
      }
      right_resize.addEventListener("mousedown", (e) => {
        e.preventDefault();
        mouse_down_position = e.clientX;
        mouse_down_width = Number.parseFloat(window.getComputedStyle(temp_this.element).width.replace("px", ""));
        document.addEventListener("mousemove", right_resize_listener);
      });
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", right_resize_listener);
    });
    }

    initializeAudio() {
      this.sample_buffer = audiocontext.createBuffer(2, this.data.length, audiocontext.sampleRate*2);
      this.sample_buffer.copyToChannel(Float32Array.from(this.data), 0);
      this.sample_buffer.copyToChannel(Float32Array.from(this.data), 1);
      this.sample_source = audiocontext.createBufferSource();
      this.sample_source.connect(audiocontext.destination);
      this.sample_source.buffer = this.sample_buffer;
    }

    play() {
      this.sample_source.start();
    }

    stop() {
      this.sample_source.stop();
    }
  }
  