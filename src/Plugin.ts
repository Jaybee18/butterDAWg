export class Plugin {

    private path: string
    private audiocontext_name: string
    private name: string
    private audiocontext: AudioContext

    constructor(path: string) {
        this.path = path;
        this.name = "<placeholder>"

        this.loadPlugin()
    }

    loadPlugin() {
        this.audiocontext.audioWorklet.addModule(this.path).then(() => {
            console.log("successfully loaded " + this.name + "-plugin");
        });
    }
    
    getName() {
        return this.name;
    }

    getNumInputs() {
        throw new Error("not implemented");
    }

    getNumOutputs() {
        throw new Error("not implemented");
    }
}