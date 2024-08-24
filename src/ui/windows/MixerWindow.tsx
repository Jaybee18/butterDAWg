import { Window, WindowType } from "../misc/window";
import { React, globals } from "../../globals";
import { ChannelComponent } from "../Components/Channel";
import { ContextMenu } from "../Components/ContextMenu";
import { PluginWindow } from "./PluginWindow";
import { Channel } from "../../core/Channel";
import { CustomPlugin } from "../../CustomPlugin";

export class MixerWindow extends Window {

	private channels: Array<ChannelComponent>;

    constructor() {
        super(false);

		this.channels = [];
		this.type = WindowType.Mixer;
		
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

		// initialise the channel components
		globals.mixer.getChannels().forEach(channel => {
			let c = new ChannelComponent(channel);
			c.getElement().addEventListener("mousedown", () => {
				this.channels.forEach(v => v.select(false));
				c.select(true);
				this.updateChannels();
			});
			this.get(".mixer_channels").appendChild(c.getElement());
			c.update();
			this.channels.push(c);
        });
		this.channels[0].select(true);

        this.updateChannels();

		this.setContentSize(760, 320);
	}

    updateChannels() {
        //this.get(".mixer_channels").replaceChildren();
		/*this.channels = [];

        globals.mixer.getChannels().forEach(channel => {
			let c = new ChannelComponent(channel);
			c.getElement().addEventListener("mousedown", () => {
				this.channels.forEach(v => v.select(false));
				c.select(true);
				this.updateChannels();
			});
			this.get(".mixer_channels").appendChild(c.getElement());
			c.update();
			this.channels.push(c);
        });*/

		this.get(".channel_plugins").replaceChildren();
		let sample_node = <div className="plugin_slot">
			<div className="slot_wrapper">
				<i className="fa-solid fa-caret-right"></i>
				<p>Slot</p>
				<div className="plugin_volume">
					<div className="plugin_volume_knob"></div>
				</div>
			</div >
			<div className="plugin_toggle">
				<div className="plugin_toggle_green"></div>
			</div>
		</div > as any;

		if (this.channels.length > 0) {
			let plugins = this.getSelectedChannel().getPlugins();
			for (let j = 0; j < 10; j++) {
				let concrete_node = sample_node.cloneNode(true);
				if (plugins[j] === null) {
					// add empty slot
					concrete_node.querySelector(".slot_wrapper > p").innerText = "Slot " + (j + 1);
					concrete_node.querySelector(".slot_wrapper").style.backgroundColor = "#566065";
				} else {
					// add plugin
					concrete_node.querySelector(".slot_wrapper > p").innerText = plugins[j].getName();
					// visualize plugin
				}
				concrete_node.addEventListener("contextmenu", (e: MouseEvent) => {
					let plugin_context_menu = new ContextMenu(
						globals.plugins.map(plugin => plugin.getName()),
						globals.plugins.map(plugin => () => {
							this.getSelectedChannel().addPlugin(plugin.createPlugin(), j);
							this.updateChannels();
							return true;
						}),
					);
					plugin_context_menu.toggle(e);
				});
				concrete_node.addEventListener("click", () => {
					let clicked_plugin = this.getSelectedChannel().getPlugins()[j];
					if (clicked_plugin !== undefined) {
						clicked_plugin.openWindow();
					}
				});
				this.get(".channel_plugins").appendChild(concrete_node);
			}
		}
    }

	private getSelectedChannel(): Channel {
		for (let i = 0; i < this.channels.length; i++) {
			if (this.channels[i].isSelected()) return globals.mixer.getChannels()[i];
		}
		return null;
	}
}