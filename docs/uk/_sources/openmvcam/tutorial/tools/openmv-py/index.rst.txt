OpenMV Python package
=====================

The `openmv
<https://github.com/openmv/openmv-python>`__ PyPI
package is the host-side Python library for driving
an OpenMV Cam from a desktop or single-board-computer
Python program. It connects to the cam over USB,
uploads and executes scripts, streams frames back,
reads ``stdout`` from the running script, and
exchanges arbitrary binary data through named
*channels*. The same protocol the IDE uses runs
underneath, so anything the IDE does to a cam is
something a Python program can do too.

Two ways in. The included ``openmv`` command-line tool
opens a viewer and is the fastest way to verify the
package is installed and a cam is reachable. The
:class:`openmv.Camera` class is the entry point for
Python code that wants to drive a cam itself --
headless capture, automated test rigs,
:doc:`custom desktop GUIs <../projects-tools/index>`,
or any other application the IDE does not cover.

Install
-------

The package is on `PyPI
<https://pypi.org/project/openmv/>`__::

    pip install openmv

Python 3.12 or newer is required. The install pulls in
its dependencies automatically:
`pyserial <https://pypi.org/project/pyserial/>`__ for
the USB serial transport,
`numpy <https://pypi.org/project/numpy/>`__ for frame
decoding,
`pygame <https://pypi.org/project/pygame/>`__ for the
CLI viewer, and
`pyelftools <https://pypi.org/project/pyelftools/>`__
for the profiler.

.. toctree::
   :caption: Tutorial
   :maxdepth: 1

   cli.rst
   hello-cam.rst
   streaming-frames.rst
   custom-channels.rst
   events.rst

.. toctree::
   :caption: Reference
   :maxdepth: 1

   api-reference.rst
