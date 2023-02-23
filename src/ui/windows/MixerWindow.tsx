import { Window } from "../../window";
import { React, globals } from "../../globals";
import { ChannelComponent } from "../Components/Channel";

export class MixerWindow extends Window {

	private channels: Array<ChannelComponent>;

    constructor() {
        super(false);

		this.channels = [];
		
        this.initialiseContent();
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
						<div className="mixer_channels">
							{/* the channels will be added here */}
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
							{/* the plugins will be added here */}
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

        this.updateChannels();

		this.setContentSize(760, 320);
	}

    updateChannels() {
        this.get(".mixer_channels").replaceChildren();
		this.channels = [];

        globals.mixer.getChannels().forEach(channel => {
			let c = new ChannelComponent(channel);
			c.getElement().addEventListener("mousedown", () => {
				this.channels.forEach(v => v.select(false));
				c.select(true);
			});
			this.get(".mixer_channels").appendChild(c.getElement());
			c.update();
			this.channels.push(c);
        });

		this.get(".channel_plugins").replaceChildren(<p>test</p> as any);

		if (this.channels.length > 0) {
			this.channels[0].select(true);
			let plugins = globals.mixer.getSelectedChannel().getPlugins();
			for (let j = 0; j < 10; j++) {
				if (j >= plugins.length) {
					// add empty slot
				} else {
					// add plugin
				}
			}  
		}
    }

}