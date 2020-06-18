var dep = require("./cell_deps.js");
var fs = require('fs');

const args = process.argv.slice(2);
const path = args[0] + "/";

let printMode = args[1];
let reactiveCount = 0;
let recursiveCount = 0;
let topdownCount = 0;
let notebookCount = 0;

function getExt(filename){
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}


fs.readdirSync(path).forEach(file => {
    if (getExt(file) === "ipynb"){
        console.log(file);
        //console.log(path+file);
        let cellCounts = dep.calculateCells(path + file, printMode);
        reactiveCount += cellCounts.reactive;
        topdownCount += cellCounts.topDown;
        recursiveCount += cellCounts.recursive;
        notebookCount += 1;
    }
});

console.log(`Over ${notebookCount} notebooks, the reactive paradigm executed \
${reactiveCount} cells. The top-down model executed ${topdownCount} cells. \
the recursive model executed ${recursiveCount} cells.`);
