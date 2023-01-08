import { Window } from "./window";
import { React } from "./globals";

export class MixerWindow extends Window {
    constructor() {
        super();
    }

    initialiseContent(): void {
        this.get(".content").appendChild(
            <div className="mixer_wrapper">
        <div className="mixer">
          <div className="mixer_toolbar">
            <div className="tool_button">
              <i className="fa-solid fa-caret-right"></i>
            </div>
            <div className="tool_button">
              <i className="fa-regular fa-hand-pointer"></i>
            </div>
            <div className="tool_button">
              <i className="fa-solid fa-wave-square"></i>
            </div>
          </div>
          <div className="mixer_channels_wrapper">
            <div className="channel" id="master_volume">
              <div className="index_indicator">
                <p>C</p>
              </div>
              <div className="channel_volume_indicator"></div>
            </div>
            <div className="channel" id="master_channel">
              <div className="index_indicator">
                <p>M</p>
              </div>
              <div className="channel_label">
                <p>Master</p>
              </div>
              <div className="channel_volume">
                <div className="channel_volume_indicator"></div>
                <div className="channel_toggle">
                  <div className="channel_toggle_green"></div>
                </div>
                <div className="channel_pan">
                  <div className="channel_pan_knob"></div>
                </div>
              </div>
              <div className="channel_volume_slider">
                <div className="channel_volume_knob">
                  <div className="channel_volume_knob_peak"></div>
                </div>
                <div className="channel_volume_background"></div>
              </div>
              <div className="channel_links">

              </div>
            </div>
            <div className="mixer_seperator">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </div>
          </div>
        </div>
        <div className="mixer_plugins">
          <div className="plugins_toolbar"></div>
          <div className="plugins_content">
            <div className="channel_input">
              <i className="fa-solid fa-right-to-bracket"></i>
              <div className="header_snap_selector">
                <p>(none)</p>
                <i className="fa-solid fa-caret-right"></i>
              </div>
              <i className="fa-regular fa-clock"></i>
            </div>
            <div className="channel_plugins">
            </div>
            <div className="channel_eq"></div>
            <div className="channel_time"></div>
            <div className="channel_output">
              <i className="fa-solid fa-right-to-bracket"></i>
              <div className="header_snap_selector">
                <p>Out 1 - Out 2</p>
                <i className="fa-solid fa-caret-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div> as any
        );
    }
}