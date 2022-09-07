// add key event listeners
var control_down = false;
var alt_down = false;
document.addEventListener("keypress", (e) => {
  if (e.code === "Space" && !deactivate_space_to_play) {
    e.preventDefault();
    play();
  }
});
document.addEventListener("keydown", (e) => {
  control_down = e.ctrlKey;
  alt_down = e.altKey;
});
document.addEventListener("keyup", (e) => {
  control_down = e.ctrlKey;
  alt_down = e.altKey;
});
