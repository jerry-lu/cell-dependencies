from graphviz import Digraph
import sys

name = sys.argv[1]
new_name = name.split(".")[0] + ".gv"
g = Digraph('G', filename=new_name)
f = open(name, "r")

for line in f:
    l = line.split("->")
    l = list(map(str.strip, l))
    if (l):
        g.edge(l[0], l[1])

g.view()
