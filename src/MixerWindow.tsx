import { Window } from "./window";
import { globals, React } from "./globals";
import { Channel } from "./Channel";
import { PluginSlot } from "./Mixer";
import { PluginWindow } from "./temp_plugin_test";
import { ContextMenu } from "./ContextMenu";

export class MixerWindow extends Window {

	private channels: Array<Channel>
	private pluginSlotContextMenu: ContextMenu

	constructor() {
		super(false);

		this.channels = [];

		let temp_this = this;
		this.pluginSlotContextMenu = new ContextMenu(
            globals.plugins.map(plugin => plugin.getName()),
            globals.plugins.map(plugin => function () {
				temp_this.getSelectedChannel().addPlugin(plugin);
				temp_this.updatePluginSlots(temp_this.getSelectedChannel());
                return true;
            })
        );

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

		// add the channels
		for (let i = 0; i < 20; i++) {
			let a = new Channel(i);
			this.get(".mixer_channels_wrapper").appendChild(a.element);
			this.channels.push(a);
		}

		this.channels[0].select(true);

		// add the slots
		for (let i = 0; i < 10; i++) {
			let tmp = new PluginSlot("Slot " + i);
			tmp.setArrowEventListener("contextmenu", (e: any) => {
				this.pluginSlotContextMenu.toggle(e);
			});
		}

		// !debugging!
		/*
		const pluginpath = "plugins/TestPlugin";
		let win = new PluginWindow(pluginpath);
		setTimeout(() => {
			let plugin = win.getPlugin();
			console.log(plugin);
			this.channels[0].addPlugin(plugin);
	
			// display the plugins of the first channel
			this.channels[0].select(true);
			let channel_plugins = this.channels[0].getPlugins();
			for (let i = 0; i < 10; i++) {
				if (i < channel_plugins.length) {
					new PluginSlot(channel_plugins[i].getName());
				} else {
					new PluginSlot("Slot " + i);
				}
			}
		}, 2000);*/

		this.setContentSize(760, 320);
	}

	updatePluginSlots(channel: Channel) {
		// clear
		this.get(".channel_plugins").childNodes.forEach(v => this.get(".channel_plugins").removeChild(v));

		let channel_plugins = channel.getPlugins();
		for (let i = 0; i < 10; i++) {
			if (i < channel_plugins.length) {
				new PluginSlot(channel_plugins[i].getName());
			} else {
				new PluginSlot("Slot " + i);
			}
		}
	}

	getSelectedChannel(): Channel {
		for (let i = 0; i < this.channels.length; i++) {
			if (this.channels[i].isSelected()) return this.channels[i];
		}
		return null;
	}
}