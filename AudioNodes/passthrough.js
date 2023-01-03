// white-noise-processor.js
class Passthrough extends AudioWorkletProcessor {
	process(inputs, outputs) {
		const input = inputs[0];
		const output = outputs[0];
		
		for (let channel = 0; channel < input.length; channel++) {
			for (let i = 0; i < input[channel].length; i++) {
				output[channel][i] = input[channel][i];
			}
		}

		return true;
	}
}

registerProcessor("passthrough", Passthrough);
