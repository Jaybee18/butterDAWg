export type BitCrusher = {
    parameterDescriptors(): Array<{name: string, defaultValue: number, minValue: number, maxValue: number}>
    process(input: any, output: any): boolean
}