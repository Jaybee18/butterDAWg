import { globals } from "../globals";
import { Sample } from "./Sample";
import { Track } from "./Track";

export class Playlist {

    private tracks: Array<Track>;

    constructor() {
        this.tracks = [];
    }

    getTrackCount() {
        return this.tracks.length;
    }

    getTracks() {
        return this.tracks;
    }

    newTrack() {
        let track = new Track();
        this.tracks.push(track);
        return track;
    }

    play() {
        globals.audiocontext.resume().then(() => {
            this.tracks.forEach(track => {
                track.play();
            });
        });
    }

    stop() {
        globals.audiocontext.suspend();
    }
}