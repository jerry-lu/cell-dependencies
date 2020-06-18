var fs = require('fs');
var utils = require("./cell_utils.js");

function printDependencies(cells, printMode, dict){
    for (let cell of cells){
        cell.dependentOn.forEach(element =>
            console.log(utils.printCell(element, printMode, dict) + " -> " + utils.printCell(cell.metadata.persistent_id, printMode, dict)));
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
    
            if (useCell !== undefined && !useCell.dependentOn.includes(defCell.metadata.persistent_id)){
                useCell.dependentOn.push(defCell.metadata.persistent_id);
            }
        }
    
        if (printMode === undefined){	printMode = "id";	}
        let idx = utils.getRandomInt(0, cells.length-1)
        let selectedCell = cells[idx];

        //console.log("These are all of the cell dependency relations in the notebook");
        //printDependencies(cells, printMode, dict);

        console.log(`\nWe want to execute cell number ${ selectedCell.execution_count } in ${name}`);
        //console.log(utils.getSourceFromCell(selectedCell));
        console.log("\nthese are the cells it depends on \n")
        ancestors = utils.breadthFirstSearch(selectedCell, dict);
        console.log(cellSetToArray(ancestors));

        console.log(`\nReactive: run ${ ancestors.size } cells`);

        // how many would we have to run if we assume top down?
        // if top down, then we run every cell prior to the current one
        // i.e. if the current index is idx, then we run cells 0 through (idx - 1)
        console.log(`Top-down: run ${ idx } cells`);
        return ({reactive: ancestors.size, topDown: idx});

    }
}