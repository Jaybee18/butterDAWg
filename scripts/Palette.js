// palette functionality
// TODO event listeners setup may be a bit inefficient
var palette = document.querySelector(".palette");
var palette_current_scope = 0;
var palette_current_element = null; /* current selected object to paint on tracks */
var palette_content = [[], [], []]; // list of lists of 'Item's
var scopes = document.querySelectorAll(".palette_scope > .tool_button");
for (let j = 0; j < 3; j++) {
  scopes[j].style.fill = "#8f979b";
}
scopes[0].style.fill = "#d2d8dc";
for (let i = 0; i < scopes.length; i++) {
  scopes[i].addEventListener("click", () => {
    palette_current_scope = i;
    var content = "";
    palette_content[i].forEach(item => {
      content += '<div class="palette_object">\
                    <i class="fa-solid fa-wave-square"></i>\
                    <p>' + item.title.split(".")[0] + '</p>\
                  </div>';
    });
    palette.innerHTML = content;
    for (let j = 0; j < palette.childElementCount; j++) {
      palette.children[j].addEventListener("click", () => {
        for (let k = 0; k < palette.childElementCount; k++) {
          palette.children[k].style.boxShadow = "";
        }
        palette.children[j].style.boxShadow = "inset 0 0 0 1px #a8e44a";
        palette_current_element = palette_content[i][j];
      });
    }
    for (let j = 0; j < 3; j++) {
      scopes[j].style.fill = "#8f979b";
    }
    scopes[i].style.fill = "#d2d8dc";
  });
}
palette.addEventListener("mouseenter", () => {
  // sample preview
  if (current_drag_element !== null) {
    palette.insertAdjacentHTML("beforeend", '<div class="palette_object" style="opacity: 0.3;">\
                                              <i class="fa-solid fa-wave-square"></i>\
                                              <p>' + current_drag_element.title.split(".")[0] + '</p>\
                                            </div>');
    drag_container.style.display = "none";
  }
});
palette.addEventListener("mouseleave", () => {
  if (current_drag_element !== null) {
    palette.lastChild.remove();
    drag_container.style.display = "block";
  }
});
palette.addEventListener("mouseup", () => {
  if (current_drag_element !== null) {
    var newChild = palette.lastElementChild;
    newChild.style.opacity = "1";
    palette_content[palette_current_scope].push(current_drag_element);
    var index = palette_content[palette_current_scope].length-1;
    newChild.addEventListener("click", () => {
      for (let i = 0; i < palette.childElementCount; i++) {
        palette.children[i].style.boxShadow = "";
      }
      newChild.style.boxShadow = "inset 0 0 0 1px #a8e44a";
      palette_current_element = palette_content[palette_current_scope][index];
    });
  }
});

// event listener for dragging
var drag_container = document.getElementById("drag_container");
document.addEventListener("mousemove", (e) => {
  if (current_drag_element === null) {return;}
  if (!drag_container.hasChildNodes()) {
    var clone = current_drag_element.getDragElement().cloneNode(true);
    drag_container.appendChild(clone);
    drag_container.style.display = "block";
  }
  drag_container.style.left = (e.clientX - drag_container.clientWidth/2) + "px";
  drag_container.style.top = e.clientY + "px";

  // angle container for visual appeal
  drag_container.style.transform = "rotateZ(" + e.movementX + "deg)";
});
document.addEventListener("mouseup", () => {
  if (current_drag_element !== null) {
    drag_container.style.display = "none";
    drag_container.firstChild.remove();
    current_drag_element = null;
  }
});

// add sidebar tree functionality
// make a class for sidebar_items that holds which indent level they have
var indent_width = 25;
var sidebar = document.getElementById("sidebar");
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
// fill the sidebartree data
function mapFolder(folder) {
  if (!fs.existsSync(folder)) {return null;}
  // if 'folder' is a file, only return the file
  if (fs.lstatSync(folder).isFile()) {
    if (folder[0] === ".") {return null;}
    return folder;
  }
  // 'folder' is a folder, recursively map the remaining contents
  let res = new Map();
  var filenames = fs.readdirSync(folder);
  filenames.forEach(file => {
    let content = mapFolder(folder + "/" + file);
    if (content !== null) {
      res.set(file, content);
    }
  });
  return res;
}
let hirachy = mapFolder(__dirname + "/files");

var sidebar_folder_colors = { 
  "0Current project": "#aa8070",
  "1Recent files": "#7ca366",
  "2Plugin database": "#6781a4",
  "3Plugin presets": "#8f6080",
  "4Channel presets": "#8f6080",
  "5Mixer presets": "#8f6080",
  "6Scores": "#8f6080",
  "Backup": "#7ca366",
  "Clipboard files": "#6b818d",
  "Demo projects": "#689880",
  "Envelopes": "#6b818d",
  "IL shared data": "#689880",
  "Impulses": "#6b818d",
  "Misc": "#6b818d",
  "My projects": "#689880",
  "Packs": "#6781a4",
  "Project bones": "#aa8070",
  "Recorded": "#6b818d",
  "Rendered": "#6b818d",
  "Sliced audio": "#6b818d",
  "Soundfonts": "#6b818d",
  "Speech": "#689880",
  "Templates": "#689880"
};

hirachy.forEach((element, key) => {
  var a = new Item(key, element);
  a.appendToSidebar();
});
