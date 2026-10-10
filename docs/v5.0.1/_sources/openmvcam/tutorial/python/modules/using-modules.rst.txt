Using modules
=============

A *module* is a collection of Python code -- functions, classes,
constants -- packaged so it can be reused across many scripts.
Python ships with a standard library full of them, and the OpenMV
firmware adds more for talking to the camera. Reaching into a
module is done with ``import``.

import
------

The most direct form pulls in the whole module under its own name:

::

    import math

    print(math.sqrt(2))

Output::

    1.4142135623730951

After the ``import``, every name defined by ``math`` is reachable
as ``math.<name>``. The module name comes from its filename
(without ``.py``); the namespace prefix keeps two modules with
the same function name from colliding.

from ... import
---------------

To pull specific names directly into the current scope, use
``from``:

::

    from math import sqrt, pi

    print(sqrt(2), pi)

Output::

    1.4142135623730951 3.141592653589793

There is no namespace prefix anymore. This is convenient for
names used a lot, but a ``from`` import that brings in many names
makes it harder to tell where each name came from. Plain
``import math`` is usually clearer in larger scripts.

The star form ``from math import *`` brings in *everything* the
module exports. Skip it -- it pollutes the namespace and trips up
the IDE's autocomplete.

Aliasing with as
----------------

Long module names can be shortened with ``as``:

::

    import json as j

    j.dumps({"ok": True})

The same trick works on individual names imported with ``from``:

::

    from math import sqrt as root

    root(9)              # 3.0

For general Python code, alias only when the original name is
genuinely long or clashes with something else already in scope.

Available modules
-----------------

The :doc:`library reference </library/index>` lists every module
shipped on the camera -- the MicroPython standard library and the
OpenMV-specific modules that drive the image sensor, run machine
vision, and control the on-board hardware. All of them use the
same ``import`` mechanism shown above.
