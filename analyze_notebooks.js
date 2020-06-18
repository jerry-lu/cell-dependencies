var dep = require("./cell_deps.js");
var fs = require('fs');

const args = process.argv.slice(2);
const path = args[0] + "/";

let printMode = args[0];

//const name = "news_cat_fixed.ipynb";
let reactiveCount = 0;
let topdownCount = 0;
let notebookCount = 0;

function getExt(filename){
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}

fs.readdirSync(path).forEach(file => {
    if (getExt(file) === "ipynb"){
        //console.log(path+file);
        let cellCounts = dep.calculateCells(path + file, printMode);
        reactiveCount += cellCounts.reactive;
        topdownCount += cellCounts.topDown;
    }
    notebookCount += 1;
});

console.log(`Over ${notebookCount} notebooks, the reactive paradigm executed \
${reactiveCount} cells. The top-down model executed ${topdownCount} cells`);
