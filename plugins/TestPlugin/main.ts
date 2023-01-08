import { CustomPlugin } from "../../src/CustomPlugin";

export class Plugin extends CustomPlugin {

    private level: AudioParam;

    constructor() {
        super();

        this.name = "MyCustomPlugin";

        this.initialiseUI();
    }

    initialiseUI(): void {
        // draw those little lines and numbers on the slider
        let canvas = document.querySelector(".plugin-slider-background") as HTMLCanvasElement;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        let ctx = canvas.getContext("2d");

        ctx.strokeStyle = "#a8a8a8";
        ctx.lineWidth = 1.5;
        ctx.font = "10pt Calibri";
        ctx.fillStyle = "#a8a8a8";
        ctx.beginPath();
        const padding = 5;
        const step = (canvas.height - padding * 2) / 20;
        for (let i = 0; i < 21; i++) {
            if (i % 2 == 0) {
                ctx.moveTo(canvas.width / 2 - 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 - 10, padding + i * step);
                ctx.moveTo(canvas.width / 2 + 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 + 10, padding + i * step);
                ctx.fillText(((10 - i / 2) * 10).toString(), canvas.width / 2 + 25, padding + i * step + 4);
            } else {
                ctx.moveTo(canvas.width / 2 - 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 - 15, padding + i * step);
                ctx.moveTo(canvas.width / 2 + 20, padding + i * step);
                ctx.lineTo(canvas.width / 2 + 15, padding + i * step);
            }
        }
        ctx.stroke();

    }
    
    onAudioNodeLoaded() {
        this.level = (this.audio_node as any).parameters.get("level");

        // add drag functionality to the handle
        let handle = document.querySelector(".plugin-handle") as HTMLElement;
        let canvas = document.querySelector(".plugin-slider-background") as HTMLCanvasElement;
        let temp_this = this;
        function handleMovement(e: MouseEvent) {
            let value = Math.min(Math.max(-26, handle.offsetTop + e.movementY), canvas.height - 37);
            handle.style.top = value + "px";
            temp_this.level.value = 1 - (value + 26) / (26 + (canvas.height - 37));
            //console.log(temp_this.level.value);
        }
        handle.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", handleMovement);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", handleMovement);
        });
    }
}
