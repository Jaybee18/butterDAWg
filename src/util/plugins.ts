export function discoverPlugins() {
    // TODO scan a dedicated plugin folder in the future
    return ["/Users/jbes/GitHub/butterDAWg/SimpleDistortion.bdp"]
}

export function getPluginNameFromPath(pluginPath: string) {
    const folderName = pluginPath.split('\\').pop().split('/').pop();
    const pluginName = folderName.substring(0, folderName.lastIndexOf("."));
    return pluginName;
}
