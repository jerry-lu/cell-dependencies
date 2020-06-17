# cell-dependencies

Parse Python computational notebooks to get cell dependencies

## Requirements

You will need to install [this library](https://github.com/andrewhead/python-program-analysis/) and modify the relative path to that library in `cell_utils.js`

Print cell dependencies to the terminal by running `node cell_deps.js your_notebook.ipynb your_print_mode`
The choices for print mode are:

- `id` the persistent id
- `code` the source code
- `line` the line numbers
- `count` the execution count of the cell

The execution count is the number that appears by the cell when you run it, and I recommend using the `count` mode. 

`graph_visual.py` outputs a dependency graph of the cells

![dependency graph](news_cat.gv.pdf?raw=true)
