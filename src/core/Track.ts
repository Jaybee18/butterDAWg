import { Color } from "../ui/misc/Color";
import { Connectable, globals } from "../globals";
import { Sample } from "./Sample";

export class Track implements Connectable {

    private audionode: AudioNode;
    private samples: Array<Sample>;
    private enabled: boolean;

    // ui stuff
    private title: string;
    private color: Color;

    constructor() {
        this.enabled = true;
        this.samples = [];

        this.title = "";
        this.color = null;

        this.audionode = new GainNode(globals.audiocontext);
    }

    getTitle() {
        return this.title;
    }

    setTitle(title: string) {
        this.title = title;
    }

    isActive() {
        return this.enabled;
    }

    setActive(active: boolean) {
        this.enabled = active;
    }

    getSamples() {
        return this.samples;
    }

    removeSample(sample: Sample) {
        sample.disconnect(this);
        this.samples.splice(this.samples.indexOf(sample), 1);
    }

    addSample(sample: Sample) {
        sample.connect(this);
        this.samples.push(sample);
    }

    play() {
        this.samples.forEach(sample => {
            let node = sample.getAudioNode();
		    const timestamp = globals.audiocontext.currentTime + (sample.getTimestamp() - globals.current_time/1000);
            // TODO there is also a offset parameter in .start() -> use that when the cursor is somewhere
		    // in the middle of the sample
            if (timestamp >= globals.audiocontext.currentTime) {
                node.start(timestamp);
            } else if (timestamp + sample.getDuration()/1000 >= globals.audiocontext.currentTime) {
                node.start(globals.audiocontext.currentTime, globals.audiocontext.currentTime - timestamp);
            }
        });
    }

    connect(object: Connectable) {
        this.audionode.connect(object.getAudioNode());
    }

    getAudioNode(): AudioNode {
        return this.audionode;
    }
}