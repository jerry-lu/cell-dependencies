var py = require("../../python-program-analysis");

module.exports = {
    getSourceFromCell: function(cell){
		return cell.source.join('')
	},

	isInCellBoundaries: function(lineNo, cellLineNos){
	    let first = cellLineNos[0];
	    let last = cellLineNos[1];
	    return (lineNo >= first && lineNo <= last);
	},

	getDefUse: function(code){
		let tree = py.parse(code);
		let cfg = new py.ControlFlowGraph(tree);
		const analyzer = new py.DataflowAnalyzer();
		const flows = analyzer.analyze(cfg).dataflows;
		return flows;
	},

	getRandomInt: function(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	breadthFirstSearch: function(cell, dict){
		visited = new Set();
		stack = [cell];
		while (stack.length > 0){
			let current = stack.pop();
			visited.add(current);
			if (current.dependentOn !== undefined){
				current.dependentOn.forEach(neighbor => {
					neighbor = dict[neighbor];
					if (!visited.has(neighbor)){
						stack.push(neighbor);
					}
				});
			}
		}
		visited.delete(cell);
		return visited;
	},

	// printCell takes in an execution count and outputs the corresponding cell according to the mode parameter
	printCell: function(count, mode, dict){
		let currentCell = dict[count];
		if (mode === "code"){
			return utils.getSourceFromCell(currentCell);
		} else if (mode === "line"){
			return currentCell.lineNos;
		} else {
			// (mode == "count")
			return count;
		}
	}
}

