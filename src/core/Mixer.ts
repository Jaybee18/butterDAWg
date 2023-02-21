import { Channel } from "./Channel";

export class Mixer {

    private channels: Array<Channel>;
    private master: Channel;

    constructor() {
        this.channels = [];
        
        // add initial channel
        this.master = new Channel();
        this.newChannel();
    }

    getChannels() {
        return this.channels;
    }

    newChannel(): Channel {
        let channel = new Channel();
        channel.setName("Channel " + this.channels.length);
        this.channels.push(channel);
        return channel;
    }
}