// white-noise-processor.js
export class Passthrough extends AudioWorkletProcessor {
	process(inputs, outputs) {
		const input = inputs[0];
		const output = outputs[0];
		output.forEach((channel) => {
			for (let i = 0; i < channel.length; i++) {
				channel[i] = input[i]; //Math.random() * 2 - 1;
			}
		});
		return true;
	}
}

registerProcessor("passthrough", Passthrough);
