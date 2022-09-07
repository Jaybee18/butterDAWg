// bpm count drag functionality
var bpm_count = document.querySelector(".bpm");
var bpm_count_text = document.getElementById("bpm_count");
function bpm_drag(e) {
  bpm -= e.movementY/4;
  bpm = Math.max(bpm, 0);
  bpm_count_text.innerHTML = Math.round(bpm);
}
bpm_count.addEventListener("mousedown", () => {
  document.addEventListener("mousemove", bpm_drag);
});
document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", bpm_drag);
});