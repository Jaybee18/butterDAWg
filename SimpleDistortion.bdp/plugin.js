// import with require:
// const w = require("wavefile")

class SimpleDistortion extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'drive',
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
      },
    ];
  }

  constructor(options) {
    super(options);
    this.distortion_function = (x) =>
      ((Math.PI + 50) * x) / (Math.PI + 50 * Math.abs(x));
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < input.length; channel++) {
      for (let i = 0; i < input[channel].length; i++) {
        if (input[channel][i] === 0) {
          output[channel][i] = 0;
        } if (parameters.drive[0] < 0.1) {
          output[channel][i] = input[channel][i];
        } else {
          output[channel][i] = (input[channel][i]/Math.abs(input[channel][i])) * (1 - Math.exp(-Math.abs((input[channel][i] * Math.max(parameters.drive[0]*40, 1)))));
          output[channel][i] = this.distortion_function(
            input[channel][i] * parameters.drive[0] * 40,
          );
        }
      }
    }

    return true;
  }
}

registerProcessor('SimpleDistortion', SimpleDistortion);
