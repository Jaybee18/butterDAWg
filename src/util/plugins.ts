import { readdirSync } from "fs";

export function discoverPlugins() {
    // scan the built-in plugin folder
    let plugins = readdirSync("plugins/");
    plugins = plugins.map(v => "plugins/" + v);

    // the returned paths can either be absolute or relative to the source dir
    return plugins;
}

export function getPluginNameFromPath(pluginPath: string) {
    const folderName = pluginPath.split('\\').pop().split('/').pop();
    const pluginName = folderName.substring(0, folderName.lastIndexOf("."));
    return pluginName;
}
