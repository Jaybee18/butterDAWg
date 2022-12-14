import { Window, toolbarButtonOptions } from "./window";
import { cumulativeOffset, globals, pixels_to_ms } from "./globals";
import { Track } from "./Track";
import { BrowserWindow } from "electron";
import { Color } from "./Color";
import { readdirSync } from "fs";

class Playlist extends Window {
	constructor() {
		super();
	}

	initialiseContent(): void {
		this.get(".content").innerHTML = `
        <div class="tracks_wrapper">
        <div class="tracks_palette_wrapper">
            <div class="tracks_palette">
              <div class="palette_scope">
                <div class="tool_button">
                  <svg width="25" height="20" viewportWidth="25 20" class="piano_svg">
                    <path d="M 0 0 H 25 V 20 H 0 V 0 Z M 10 0 H 5 V 15 H 10 V 0 Z M 15 0 V 15 H 20 V 0 H 15 Z"></path>
                  </svg>
                </div>
                <div class="tool_button">
                  <svg width="25" height="24" viewportWidth="25 24" class="wave_svg">
                    <path d="M 0 12 C 3 5 4 5 7 12 C 12 28 13 28 18 12 C 21 5 22 5 25 12 C 22 19 21 19 18 12 C 13 -4 12 -4 7 12 C 4 19 3 19 0 12 Z"></path>
                  </svg>
                </div>
                <div class="tool_button">
                  <svg width="6" height="23" class="automation_svg">
                    <path d="M 3 20.5 A 0.5 0.5 90 0 0 3 17.5 A 0.5 0.5 90 0 0 3 20.5 Z M 3 16 A 0.5 0.5 90 0 1 3 22 A 0.5 0.5 90 0 1 3 16 Z Z M 3 19 L 3 3 M 3 1.5 A 0.5 0.5 90 0 1 3 4.5 A 0.5 0.5 90 0 1 3 1.5 M 3 0 A 0.5 0.5 90 0 0 3 6 A 0.5 0.5 90 0 0 3 0 Z M 2 15 L 2 7 L 4 7 L 4 15 Z"></path>
                  </svg>
                </div>
              </div>
              <div style="display: flex; height: inherit; width: 200px;">
                <div class="palette">
                  <!-- will be filled by the code later -->
                </div>
                <div class="palette_scrollbar">
                  <div class="palette_scrollbar_top"></div>
                  <div class="palette_scrollbar_handle"></div>
                  <div class="palette_scrollbar_bottom"></div>
                </div>
              </div>
            </div>

            <div class="tracks_wrapper_wrapper">
              <div class="tracks_top_bar">
                <div style="position: relative;">
                  <svg width="104" height="42" style="margin-left: 0px; flex-shrink: 0;">
                    <path fill="#50595e" stroke-width="1" stroke="#000000aa" d="m 1 41 l 0 0 c 0 -8 0 -8 12 -20 l 8 -8 c 12 -12 12 -12 28 -12 l 54 0 l 0 40 z" />
                    <path fill="none" stroke-width="1" stroke="#5c656a" d="m 2 40 l 0 0 c 0 -7 0 -7 12 -19 l 8 -8 c 11 -11 11 -11 27 -11 l 53 0 l 0 38 z" />
                  </svg>
                  <svg width="25" height="20" viewportWidth="25 20" fill="#8f979b" class="piano_svg">
                    <path d="M 0 0 H 25 V 20 H 0 V 0 Z M 10 0 H 5 V 15 H 10 V 0 Z M 15 0 V 15 H 20 V 0 H 15 Z"></path>
                  </svg>
                  <svg width="6" height="23" fill="#8f979b" class="automation_svg">
                    <path d="M 3 20.5 A 0.5 0.5 90 0 0 3 17.5 A 0.5 0.5 90 0 0 3 20.5 Z M 3 16 A 0.5 0.5 90 0 1 3 22 A 0.5 0.5 90 0 1 3 16 Z Z M 3 19 L 3 3 M 3 1.5 A 0.5 0.5 90 0 1 3 4.5 A 0.5 0.5 90 0 1 3 1.5 M 3 0 A 0.5 0.5 90 0 0 3 6 A 0.5 0.5 90 0 0 3 0 Z M 2 15 L 2 7 L 4 7 L 4 15 Z"></path>
                  </svg>
                  <svg width="25" height="24" fill="#8f979b" viewportWidth="25 24" class="wave_svg">
                    <path d="M 0 12 C 3 5 4 5 7 12 C 12 28 13 28 18 12 C 21 5 22 5 25 12 C 22 19 21 19 18 12 C 13 -4 12 -4 7 12 C 4 19 3 19 0 12 Z"></path>
                  </svg>
                </div>
                <div id="tracks_top_bar_inner" style="overflow: hidden;">
                  <div class="tracks_top_bar_scrollbar">
                    <div class="tracks_top_bar_scrollbar_left" style="float: left;"><i class="fa-solid fa-chevron-left"></i></div>
                    <div class="tracks_top_bar_scrollbar_handle" id="tracks_top_bar_scrollbar_handle"></div>
                    <div class="tracks_top_bar_scrollbar_right" style="float: right;"><i class="fa-solid fa-chevron-right"></i></div>
                  </div>
                  <div class="tracks_top_bar_bars_wrapper">
                    <div class="tracks_top_bar_bars">
                      <svg width="20" height="20" viewBox="0 0 20 20" id="bars_cursor">
                        <filter id='inset-shadow'>
                          <!-- Shadow offset -->
                          <feOffset
                                  dx='0'
                                  dy='2'
                                />
                          <!-- Shadow blur -->
                        <feGaussianBlur
                                  stdDeviation='2'
                                  result='offset-blur'
                                />
                          <!-- Invert drop shadow to make an inset shadow-->
                          <feComposite
                                  operator='out'
                                  in='SourceGraphic'
                                  in2='offset-blur'
                                  result='inverse'
                                />
                          <!-- Cut colour inside shadow -->
                          <feFlood
                                  flood-color='#ffffffaa'
                                  flood-opacity='.35'
                                  result='color'
                                />
                          <feComposite
                                  operator='in'
                                  in='color'
                                  in2='inverse'
                                  result='shadow'
                                />
                          <!-- Placing shadow over element -->
                          <feComposite
                                  operator='over'
                                  in='shadow'
                                  in2='SourceGraphic'
                                /> 
                        </filter>
                        <path fill="#b9ea70" d="M 0 0 L 0 3 L 10 13 L 20 3 L 20 0 Z" filter="url(#inset-shadow)"></path>
                      </svg>
                      <!-- will be filled with bar text objects -->
                    </div>
                  </div>
                </div>
              </div>
              <div class="tracks" id="tracks">
                <div class="line_cursor"></div>
              <!-- track template -->
                <template id="track_template">
                  <div class="track" id="replace_this_id">
                    <div id="track_wrap">
                      <div class="description">
                        <p style="margin: 0px;" id="track_title">track_name</p>
                          <i class="fa-solid fa-ellipsis"></i>
                          <div class="radio_btn"><div class="radio_btn_green"></div></div>
                          <div id="track_resize"></div>
                      </div>
                      <div class="track_play_indicator"></div>
                      <div class="track_content">
                        <div class="track_background">
                          <!--<canvas id="track_canvas" width="10000" height="500"></canvas>-->
                          <!-- the tile_divs will be spawned here -->
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        `;

    // first load all possible audio plugins, then initialise the tracks so the
    // tracks can be sure that every module is loaded and they don't have to
    // import any
    let plugin_promises = readdirSync("AudioNodes").map((v) => {
      return globals.audiocontext.audioWorklet.addModule("AudioNodes/" + v);
    });
    Promise.allSettled(plugin_promises).then(() => {
      for (let i = 0; i < 10; i++) {
        new Track();
      }
    });

		// add mouse wheel dragging
		let drag_mouse_down_pos_x = 0;
		let drag_mouse_down_pos_y = 0;
		let delta_delta_x = 0;
		let delta_delta_y = 0;
		let wheel_down = false;
		this.get(".tracks").addEventListener("mousedown", (e) => {
			e.preventDefault();
			if (e.button === 1) {
				drag_mouse_down_pos_x = e.clientX;
				drag_mouse_down_pos_y = e.clientY;
				wheel_down = true;
			}
		});
		document.addEventListener("mouseup", () => { wheel_down = false; delta_delta_x = 0; delta_delta_y = 0; });
		let bars = this.get(".tracks_top_bar_bars_wrapper");
		let bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
		let bars_scrollbar_wrapper = this.get(".tracks_top_bar_scrollbar");
		let maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
		let temp_this = this;
		function tracks_scroll_by_px(pixelX: number, pixelY: number) {
			let track_width = globals.tracks[0].content.querySelector(".track_background").clientWidth - globals.tracks[0].content.clientWidth;
			globals.tracks.forEach((t: Track) => {
				t.content.scrollBy({ left: pixelX });
			});
			var percent = globals.tracks[0].content.scrollLeft / track_width;
			bars_scrollbar_handle.style.left = (20 + maxX * percent) + "px";

			bars.scrollBy({ left: pixelX });
			bars.scrollLeft = Math.min(bars.scrollLeft, track_width);
			temp_this.get(".tracks").scrollBy({ top: pixelY });
		}
		this.get(".tracks").addEventListener("mousemove", (e) => {
			if (wheel_down) {
				var deltaX = drag_mouse_down_pos_x - e.clientX;
				var deltaY = drag_mouse_down_pos_y - e.clientY;
				tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
				delta_delta_x = deltaX;
				delta_delta_y = deltaY;
			}
		});

		// the playlist slider at the top of the widget
		let initial_handle_offset = 0;
		let tracks_scroll_percent = 0;
		let current_track_scroll_percent = 0;
		let track_width = 0;
		function tracks_scroll_to(percentX: number, percentY: number) {
			current_track_scroll_percent = percentX;
			track_width = globals.tracks[0].content.querySelector(".track_background").clientWidth - globals.tracks[0].content.clientWidth;
			maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
			globals.tracks.forEach(t => {
				t.content.scrollTo({ top: percentY, left: percentX * track_width });
			});
			bars.scrollTo({ left: percentX * track_width });
			bars_scrollbar_handle.style.left = (20 + maxX * percentX) + "px";
		}
		function bars_scrollbar_handle_listener(e: MouseEvent) {
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

		// play indicator drag listener
		let top_bar = this.get("#tracks_top_bar_inner");
		let top_bar_bars = this.get(".tracks_top_bar_bars");
		let cursor = this.get("#bars_cursor");
		let track_bar_cursor = this.get(".line_cursor");
		let sidebar = this.get(".tracks_palette");
		function bars_cursor_move_listener(e: MouseEvent) {
			if (e.clientX - cumulativeOffset(top_bar).left <= 0) { cursor.style.left = "-10px"; return; }
			var newX = e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft;
			cursor.style.left = newX + "px";
			globals.cursor_pos = newX;
			globals.current_time = pixels_to_ms(newX);
			track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + globals.cursor_pos + bars.scrollLeft + 97 + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
		}
		top_bar_bars.addEventListener("mousedown", (e) => {
			cursor.style.left = (e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft).toString() + "px";
			document.addEventListener("mousemove", bars_cursor_move_listener);
		});
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", bars_cursor_move_listener);
		});

    // tool buttons
    this.addToolbarButton("fa-solid fa-magnet", new Color("#7eefa9"), () => {}, <toolbarButtonOptions> {
      customCss: "transform: rotate(180deg) translate(0.5px, 1px);",
      customParentCss: "margin-right: 17px;"
    });
    this.addToolbarButton("fa-solid fa-pencil", new Color("#fcba40"), () => {});
    this.addToolbarButton("fa-solid fa-brush", new Color("#7bcefd"), () => {}, <toolbarButtonOptions> {
      customCss: "transform: translate(1px, 0.5px) rotate(-45deg);"
    });
    this.addToolbarButton("fa-solid fa-ban", new Color("#ff5b53"), () => {});
    this.addToolbarButton("fa-solid fa-volume-xmark", new Color("#ff54b0"), () => {});
    this.addToolbarButton("fa-solid fa-arrows-left-right", new Color("#ffa64a"), () => {});
    this.addToolbarButton("fa-solid fa-spoon", new Color("#85b3ff"), () => {});
    this.addToolbarButton("fa-solid fa-expand", new Color("#ffab60"), () => {});
    this.addToolbarButton("fa-solid fa-magnifying-glass", new Color("#85b3ff"), () => {});
    this.addToolbarButton("fa-solid fa-volume-high", new Color("#ffa64a"), () => {}, <toolbarButtonOptions> {
      customCss: "transform: scale(0.9);"
    });
    
		this.setContentSize(1200, 700);
	}
}

new Playlist();