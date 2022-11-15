/*
    This class is the barebone to any other class that uses audio data
    (imported from files) and provides those more high-level classes
    with data
*/

class Source {
    constructor(path) {
        // path to the source file
        this.path = path;
        this.filename = path.substring(path.lastIndexOf("/"))
        console.log(this.path, this.filename) // testing

        // WaveFile object of audio file
        this.wavefile = null;

        // audio buffer holding the files audio data
        this.audio_buffer = null;

        this.loadData();
    }

    loadData() {
        // load the audio data from the given path into this object
        this.wavefile = new WaveFile(fs.readFileSync(this.path));

        // make sure all audio data fed into the program is the same format (float 32 bit)
        if (this.wavefile.bitDepth !== "32f") {
            this.wavefile.toBitDepth("32f");
        }

        // fill this objects audio buffer
        let tmp = Float32Array.from(this.wavefile.getSamples(true, this.depth_type));
        this.audio_buffer = audiocontext.createBuffer(2, tmp.length, audiocontext.sampleRate*2);
        this.audio_buffer.copyToChannel(tmp, 0);
        this.audio_buffer.copyToChannel(tmp, 1);
    }

    getAudioBuffer() {
        return this.audio_buffer;
    }
}