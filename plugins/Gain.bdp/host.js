(function plugin(id, audioNode) {
    console.log("host of plugin", id);

    let slider_param1 = document.querySelector("#" + id + " #slider-param1");
    let output_param1 = document.querySelector("#" + id + " #value-param1");
    slider_param1.addEventListener("input", (e) => {
        output_param1.textContent = e.target.value;
        audioNode.parameters.get("level").setValueAtTime(e.target.value / 100, audioNode.context.currentTime);
    });
})
