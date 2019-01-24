
# jupyter-cvlabelling-widget

[![Build Status](https://travis-ci.org/dapicard/jupyter-cvlabelling-widget.svg?branch=master)](https://travis-ci.org/dapicard/jupyter_cvlabelling_widget)
[![codecov](https://codecov.io/gh/dapicard/jupyter-cvlabelling-widget/branch/master/graph/badge.svg)](https://codecov.io/gh/dapicard/jupyter-cvlabelling-widget)


Jupyter notebook widget that offers assisted labelling of images and videos 

## Installation

You can install using `pip`:

```bash
pip install jupyter_cvlabelling_widget
```

Or if you use jupyterlab:

```bash
pip install jupyter_cvlabelling_widget
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:
```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] jupyter_cvlabelling_widget
```
