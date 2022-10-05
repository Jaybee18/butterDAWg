// white-noise-processor.js
export class Passthrough extends AudioWorkletProcessor {

  static get parameterDescriptors () {
      return [];
    }

    constructor (options) {
      super(options);
    }

  process(inputs, outputs, parameters) {
      let input = inputs[0];
      let output = outputs[0];
      

      if (input.length === 0) {
        this.port.postMessage({"volume": 0.0});
        return false;
      }

      let max = 0.0;
      for (let channel = 0; channel < output.length; channel++) {
          for (let j = 0; j < output[channel].length; j++) {
              output[channel][j] = input[channel][j];
              max = input[channel][j] > max ? input[channel][j] : max;
          }
      }
      this.port.postMessage({'volume': max});
      return true;
      }
}

registerProcessor("passthrough", Passthrough);
