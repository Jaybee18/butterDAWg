import { globals } from "./globals";

export class Plugin {

    private path: string // TODO make this the plugins' folder
    private audiocontext_name: string
    private name: string

    constructor(path: string) {
        this.path = path;
        console.log(this.path);
        this.name = this.path.match("^.*/(.*)\\.(.*)$")[1]
        console.log(this.name);
    }

    async loadPlugin() {
        await globals.audiocontext.audioWorklet.addModule(this.path);
        console.log("successfully loaded " + this.name + "-plugin");
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