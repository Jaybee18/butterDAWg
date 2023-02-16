import { Color } from "../ui/misc/Color";
import { globals } from "../globals";
import { Sample } from "./Sample";

export class Track {

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
        this.samples.splice(this.samples.indexOf(sample));
    }

    addSample(sample: Sample) {
        this.samples.push(sample);
    }

    play() {
        this.samples.forEach(sample => {
            let node = sample.getAudioNode();
            node.connect(globals.audiocontext.destination);
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
}