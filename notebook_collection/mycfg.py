import os

c = get_config()

notebooks = []
path = "./"
for file in os.listdir(path):
    if file.endswith(".ipynb"):
        notebooks.append(os.path.join(path, file))

c.NbConvertApp.notebooks = notebooks
c.NbConvertApp.export_format = "notebook"
c.NotebookExporter.nbformat_version = 4
