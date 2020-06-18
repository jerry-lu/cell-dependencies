var fs = require('fs');
var utils = require("./cell_utils.js");
const { get } = require('http');
const { getSourceFromCell } = require('./cell_utils.js');

function printDependencies(cells, printMode, dict){
    for (let cell of cells){
        cell.dependentOn.forEach(element =>
            console.log(utils.printCell(element, printMode, dict) + " -> " + utils.printCell(cell.execution_count, printMode, dict)));
    }
}

function cellSetToArray(cells){
    let array = [];
    cells.forEach(cell => array.push(parseInt(cell.execution_count)));
    return array.sort((a, b) => a - b)
}

module.exports = {
    calculateCells: function(name, printMode){
        const programSrc = fs.readFileSync(name).toString();
        const programJson = JSON.parse(programSrc);
        
        //dict is a dictionary pointing from execution_count to the corresponding cell 
        let dict = new Object();
        let cells = [];
        let text = "";
        let currentLine = 1;
        
        if (programJson.nbformat < 4){
            console.log(`Error: ${name} Notebook version out of date`);
            return ({reactive: 0, topDown: 0});
        }

        for (let cell of programJson.cells){
            if (cell.cell_type === 'code'){
                var sourceCode = "";
                for (let line of cell.source) {
                    if (line[0] == '%' || line[0] == '!') {
                        line = "#" + line;
                    }
                    sourceCode += line;
                }
                let cellLength = cell.source.length;
                text += sourceCode + "\n";
                cell.lineNos = [currentLine, currentLine + cellLength - 1];
                cell.dependentOn = [];
                cell.dependents = [];
                currentLine += cellLength;
                cells.push(cell);
                dict[cell.execution_count] = cell;
            }
        }

        //console.log(text);

        flows = utils.getDefUse(text);

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
    
            if (useCell !== undefined && !useCell.dependentOn.includes(defCell.execution_count)){
                useCell.dependentOn.push(defCell.execution_count);
                defCell.dependents.push(useCell.execution_count);
            }
        }
    
        let idx = utils.getRandomInt(0, cells.length-1)
        let selectedCell = cells[idx];

        //console.log("These are all of the cell dependency relations in the notebook");
        //printDependencies(cells, printMode, dict);

        console.log(`\nWe want to execute cell number ${ selectedCell.execution_count } in ${name}`);
        //console.log(utils.getSourceFromCell(selectedCell));
        console.log("\nthese are the cells it depends on \n")
        ancestors = utils.breadthFirstSearch(selectedCell, dict);
        console.log(cellSetToArray(ancestors));

        console.log("these are the children cells that would have to be run under a reactive paradigm");
        children = utils.breadthFirstSearch(selectedCell, dict, true);
        console.log(cellSetToArray(children));

        // if top down, then we run every prior cell
        // let the index of the cell be idx, then we run cells 0 through (idx - 1)
        console.log(`\nTop-down: run ${ idx } cells`);
        console.log(`Reactive: run ${ children.size } cells`);
        console.log(`Reacursive: run ${ ancestors.size } cells`);

        return ({recursive: ancestors.size, reactive: children.size, topDown: idx});

    }
}