var fs = require('fs');
var utils = require("./cell_utils.js");

// how does the gather tool read in cells?
// for now, we just read the entire ipynb
const args = process.argv.slice(2);
const name = args[0];
const programSrc = fs.readFileSync(name).toString();
const programJson = JSON.parse(programSrc);

//dict is a dictionary pointing from unique ids to the corresponding cell 
let dict = new Object();
let cells = [];
let text = "";
let currentLine = 1;

for (let cell of programJson.cells){
    if (cell.cell_type === 'code'){
        let cellLength = cell.source.length;
	text += utils.getSourceFromCell(cell) + "\n"
        cell.lineNos = [currentLine, currentLine + cellLength - 1];
        cell.dependentOn = [];
        currentLine += cellLength;
        cells.push(cell);
	dict[cell.metadata.persistent_id] = cell;
    }
}

function findDependencies(flows){
    for (let flow of flows.items) {
        let defCell;
        let useCell;
        let fromNodeLineNo = flow.fromNode.location.first_line;
        let toNodeLineNo = flow.toNode.location.first_line;

        cells.forEach(function(item){
            if (utils.isInCellBoundaries(fromNodeLineNo, item.lineNos)){
                defCell = item;
            } else if (utils.isInCellBoundaries(toNodeLineNo, item.lineNos)){
                useCell = item;
            }
        })

        if (useCell !== undefined && !useCell.dependentOn.includes(defCell.metadata.persistent_id)){
            useCell.dependentOn.push(defCell.metadata.persistent_id);
        }
    }
}

// print cell takes in a uid and outputs the corresponding cell according to the mode parameter
function printCell(uid, mode){
    let currentCell = dict[uid];

	if (mode === "id"){
		return uid.slice(0, 8);
	} else if (mode === "code"){
		return utils.getSourceFromCell(currentCell);
	} else if (mode === "line"){
		return currentCell.lineNos;
	} else if (mode == "count"){
        return currentCell.execution_count;
    }
}

function printDependencies(cells, printMode){
    for (let cell of cells){
        cell.dependentOn.forEach(element =>
            console.log(printCell(element, printMode) + " -> " + printCell(cell.metadata.persistent_id, printMode)));
    }
}

function cellSetToArray(cells){
    let array = [];
    cells.forEach(cell => array.push(parseInt(cell.execution_count)));
    return array.sort()
}

flows = utils.getDefUse(text);
findDependencies(flows);

let printMode = args[1]; //can be unique id, source code, or line numbers
if (printMode === undefined){	printMode = "id";	}
let idx = utils.getRandomInt(0, cells.length-1)
let selectedCell = cells[idx];

//console.log("These are all of the cell dependency relations in the notebook");
printDependencies(cells, printMode);

/*
console.log(`\nsay we want to execute cell number ${ selectedCell.execution_count }`);
console.log(utils.getSourceFromCell(selectedCell));
console.log("then we would have to run all of the following cells:");
ancestors = utils.breadthFirstSearch(selectedCell, dict);
console.log(cellSetToArray(ancestors));
console.log(`that's ${ ancestors.size } cells`);
*/
