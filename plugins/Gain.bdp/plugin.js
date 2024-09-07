class Gain extends AudioWorkletProcessor {

	static get parameterDescriptors() {
		return [{
			name: "level",
			defaultValue: 1,
			minValue: 0,
			maxValue: 1,
		}]
	}

	constructor(options) {
		super(options);
	}

	process(inputs, outputs, parameters) {
		const input = inputs[0];
		const output = outputs[0];
		
		for (let channel = 0; channel < input.length; channel++) {
			for (let i = 0; i < input[channel].length; i++) {
				output[channel][i] = input[channel][i] * parameters.level[0];
			}
		}

		return true;
	}
}

registerProcessor("Gain", Gain);
