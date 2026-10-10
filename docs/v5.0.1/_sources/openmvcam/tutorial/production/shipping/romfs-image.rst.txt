Building a ROMFS image
======================

A *ROMFS image* is a flash-resident, read-only filesystem the
runtime auto-mounts at ``/rom``. It solves the asset problem the
previous page closed on: machine-learning model files, label
tables, JSON configuration, image templates -- anything
the application opens and reads but never writes -- ride into
the build without paying the cost of being embedded as Python
literals.

Three things make ROMFS the right tool for shipped assets:

* The filesystem is *part of the firmware image*. End users
  cannot delete a file out of ``/rom``, edit one, or replace one
  with their own.
* Files in ``/rom`` are accessible *in place*. Consumers like
  the :mod:`ml` module loading a model file get a direct view
  into flash with no RAM copy -- a multi-megabyte model on
  ``/rom`` "loads" essentially for free, where the same file
  on ``/sdcard`` is read into RAM at load time and stays there
  for the lifetime of the reference. Ordinary :func:`open` +
  ``read`` copies on demand: each ``read(n)`` call copies ``n``
  bytes from flash to RAM at the moment of the call, with a
  bare ``read()`` asking for the whole file.
* ``/rom`` and ``/rom/lib`` are added to :data:`sys.path` at
  boot. Python packages dropped into the image are importable by
  name; nothing special at the call site.

Building an image
-----------------

ROMFS images are created, edited, and flashed through the
IDE. Use it as the source of truth for the contents of every
shipped ROMFS partition.

The reason this matters: model files come with alignment
requirements that the loader at runtime enforces. ``.tflite``
files must be padded to 16-byte boundaries, and the N6's NPU
requires 32-byte alignment for compiled models. The IDE
applies that padding automatically when it writes the image.
Tools that walk the source tree without applying the padding
-- ``mpremote romfs`` in particular -- produce an image that
mounts cleanly but whose models fail at the first inference
call.

The IDE's ROMFS editor is an interactive view of the image's
contents. Files and folders can be added, renamed, and
deleted in memory; saving writes the result out as an
``.img`` file ready to flash. A typical structure for an
application that ships a model alongside some assets and a
Python package looks like::

    model.tflite
    labels.txt
    config.json
    templates/
        calibration.jpg
    lib/
        mylib/
            __init__.py
            helpers.py

.. tip::

   Both the IDE and ``mpremote`` cross-compile ``.py`` files
   to ``.mpy`` bytecode on the way into a ROMFS image, so the
   cam imports them without paying the parse cost at load
   time. Source files in the editor stay ``.py``; the image
   contains ``.mpy``.

Once the image is flashed, the tree is visible from
MicroPython at ``/rom/``::

    >>> import os
    >>> os.listdir('/rom')
    ['model.tflite', 'labels.txt', 'config.json', 'templates', 'lib']
    >>> import mylib
    >>> mylib.helpers
    <module 'mylib.helpers' from '/rom/lib/mylib/helpers.mpy'>

Most of the application lives in ROMFS
--------------------------------------

ROMFS is the right home for almost everything an application
ships: the libraries it imports, the model files it loads,
the configuration it reads, any asset whose output came from
a build tool that emits a file tree (model converters, image
pipelines, asset packers), and -- importantly -- the
application code itself.

The frozen-modules side should stay small: ``boot.py`` for
pre-REPL setup, ``main.py`` as a thin entry point, and only
the libraries the cam genuinely cannot boot without.
Everything else goes in ROMFS, where iterating on it is a
fresh ``.img`` saved out of the IDE and reflashed -- no
firmware rebuild required, no toolchain on hand to do it.

The pattern that falls out is a ``main.py`` that does
nothing but delegate into the ROMFS-resident application::

    # main.py (frozen)
    import app
    app.run()

    # /rom/app/__init__.py (in ROMFS)
    def run():
        ...

A change to ``app`` is a ROMFS edit and a reflash. The
firmware build stays put for the lifetime of the product
unless something on the frozen side actually has to change.

