"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var globals_1 = require("./globals");
var PaletteItem_1 = require("./PaletteItem");
// palette functionality
// TODO event listeners setup may be a bit inefficient
var palette = document.querySelector(".palette");
var palette_current_scope = 0;
var palette_current_element = null; /* current selected object to paint on tracks */
var palette_content = [[], [], []]; // list of lists of 'Item's
var scopes = document.querySelectorAll(".palette_scope > .tool_button");
for (var j = 0; j < 3; j++) {
    scopes[j].style.fill = "#8f979b";
}
scopes[0].style.fill = "#d2d8dc";
var _loop_1 = function (i) {
    scopes[i].addEventListener("click", function () {
        palette_current_scope = i;
        var content = "";
        palette_content[i].forEach(function (item) {
            content += '<div class="palette_object">\
                    <i class="fa-solid fa-wave-square"></i>\
                    <p>' + item.title.split(".")[0] + '</p>\
                  </div>';
        });
        palette.innerHTML = content;
        var _loop_2 = function (j) {
            palette.children[j].addEventListener("click", function () {
                for (var k = 0; k < palette.childElementCount; k++) {
                    palette.children[k].style.boxShadow = "";
                }
                palette.children[j].style.boxShadow = "inset 0 0 0 1px #a8e44a";
                palette_current_element = palette_content[i][j];
            });
        };
        for (var j = 0; j < palette.childElementCount; j++) {
            _loop_2(j);
        }
        for (var j = 0; j < 3; j++) {
            scopes[j].style.fill = "#8f979b";
        }
        scopes[i].style.fill = "#d2d8dc";
    });
};
for (var i = 0; i < scopes.length; i++) {
    _loop_1(i);
}
palette.addEventListener("mouseenter", function () {
    // sample preview
    if (globals_1.globals.current_drag_element !== null) {
        globals_1.globals.current_drag_element;
        palette.insertAdjacentHTML("beforeend", '<div class="palette_object" style="opacity: 0.3;">\
                                              <i class="fa-solid fa-wave-square"></i>\
                                              <p>' + globals_1.globals.current_drag_element.title.split(".")[0] + '</p>\
                                            </div>');
        drag_container.style.display = "none";
    }
});
palette.addEventListener("mouseleave", function () {
    if (globals_1.globals.current_drag_element !== null) {
        palette.lastChild.remove();
        drag_container.style.display = "block";
    }
});
palette.addEventListener("mouseup", function () {
    if (globals_1.globals.current_drag_element !== null) {
        var newChild = palette.lastElementChild;
        newChild.style.opacity = "1";
        palette_content[palette_current_scope].push(globals_1.globals.current_drag_element);
        var index = palette_content[palette_current_scope].length - 1;
        newChild.addEventListener("click", function () {
            for (var i = 0; i < palette.childElementCount; i++) {
                palette.children[i].style.boxShadow = "";
            }
            newChild.style.boxShadow = "inset 0 0 0 1px #a8e44a";
            palette_current_element = palette_content[palette_current_scope][index];
        });
    }
});
// event listener for dragging
var drag_container = document.getElementById("drag_container");
document.addEventListener("mousemove", function (e) {
    if (globals_1.globals.current_drag_element === null) {
        return;
    }
    if (!drag_container.hasChildNodes()) {
        var clone = globals_1.globals.current_drag_element.getDragElement().cloneNode(true);
        drag_container.appendChild(clone);
        drag_container.style.display = "block";
    }
    drag_container.style.left = (e.clientX - drag_container.clientWidth / 2) + "px";
    drag_container.style.top = e.clientY + "px";
    // angle container for visual appeal
    drag_container.style.transform = "rotateZ(" + e.movementX + "deg)";
});
document.addEventListener("mouseup", function () {
    if (globals_1.globals.current_drag_element !== null) {
        drag_container.style.display = "none";
        drag_container.firstChild.remove();
        globals_1.globals.current_drag_element = null;
    }
});
// add sidebar tree functionality
// make a class for sidebar_items that holds which indent level they have
// fill the sidebartree data
function mapFolder(folder) {
    if (!(0, fs_1.existsSync)(folder)) {
        console.log("couldn't read palette input folder");
        return new Map([["", ""]]);
    }
    // if 'folder' is a file, only return the file
    // aka arrived at the deepest possible recursion in the folder
    if ((0, fs_1.lstatSync)(folder).isFile()) {
        if (folder[0] === ".") {
            return null; // has to be null !
        }
        return folder;
    }
    // 'folder' is a folder, recursively map the remaining contents
    var res = new Map();
    var filenames = (0, fs_1.readdirSync)(folder);
    filenames.forEach(function (file) {
        var content = mapFolder(folder + "/" + file);
        if (content !== null) {
            res.set(file, content);
        }
    });
    return res;
}
var hirachy = mapFolder("./files");
hirachy.forEach(function (element, key) {
    var a = new PaletteItem_1.Item(key, element);
    a.appendToSidebar();
});
