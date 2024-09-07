import { globals } from "./globals";
import { Window } from "./ui/misc/window";
import { React } from "./globals";

class _DistortionPluginWindow extends Window {
    constructor() {
        super();
        this.setContentSize(400, 450);
        this.setResizable(false);
    }

    initialiseContent(): void {
        this.setContentWithReact(<div className="plugin-master-wrapper">
            <div className="plugin-wrapper">
                <h1>
                    Simple Distortion Plugin
                </h1>
                <div className="plugin-slider">
                    <canvas className="plugin-slider-background"></canvas>
                    <div className="groove"></div>
                    <div className="plugin-handle">
                        <div className="top-handle">
                            <div className="top-handle-stripe-1"></div>
                            <div className="top-handle-stripe-2"></div>
                            <div className="top-handle-stripe-3"></div>
                        </div>
                        <div className="handle-dark"></div>
                        <div className="bottom-handle-stripe-1"></div>
                        <div className="bottom-handle-stripe-2"></div>
                        <div className="bottom-handle-stripe-3"></div>
                        <div className="bottom-handle-grey"></div>
                    </div>
                </div>
            </div>
        </div> as any);

        // draw those little lines and numbers on the slider
        let canvas = this.get(".plugin-slider-background") as HTMLCanvasElement;
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

        let handle = this.get(".plugin-handle") as HTMLElement;
        let temp_this = this;
        function handleMovement(e: MouseEvent) {
            let value = Math.min(Math.max(-26, handle.offsetTop + e.movementY), canvas.height - 37);
            handle.style.top = value + "px";
            //temp_this.drive.value = 1 - (value + 26) / (26 + (canvas.height - 37));
        }
        handle.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", handleMovement);
        });
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", handleMovement);
        });
    }
}

export class _Plugin {

    private name: string;
    private window: Window;

    constructor() {
        this.name = "NewPlugin";
    }

    openWindow() {
        this.window = new DistortionPluginWindow();
        globals.windows.push(this.window);
    }

    closeWindow() {
        globals.windows.splice(globals.windows.indexOf(this.window), 1);
        this.window.close();
        this.window = undefined;
    }

    getName() {
        return this.name;
    }
}
