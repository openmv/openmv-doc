Hello cam
=========

The :class:`openmv.Camera` class is the Python entry
point for everything the package can do. Every other
page in this tutorial calls into it. The smallest
useful program connects, uploads a MicroPython script,
and prints whatever the script writes to ``stdout``::

    from openmv import Camera

    script = """
    import time
    while True:
        print('hello from the cam')
        time.sleep(1)
    """

    with Camera('/dev/ttyACM0') as cam:
        cam.stop()
        cam.exec(script)

        while True:
            if text := cam.read_stdout():
                print(text, end='')

A few notes
-----------

:meth:`~openmv.Camera.stop` before
:meth:`~openmv.Camera.exec` is not optional. Without
it, any previously running script keeps writing to
``stdout``, and the new ``exec`` fights it for
control of the ``stdin`` channel.

:meth:`~openmv.Camera.exec` uploads the script string
into the cam's ``stdin`` buffer and runs it in the
same MicroPython interpreter the IDE talks to. The
script imports :mod:`csi`, :mod:`image`, :mod:`ml`,
and the rest of the cam surface the earlier chapters
covered -- the only thing different is that the
source arrives over USB instead of from ``main.py``
on the camera or the IDE.

Stopping the script
-------------------

When the host program wants to interrupt the running
script, call :meth:`~openmv.Camera.stop`. The script
receives the same interrupt the IDE would deliver and
exits at the next opportunity. Leaving the context
manager (the ``with`` block) closes the serial port but
does *not* stop the script -- the cam keeps running
whatever was last loaded until something interrupts it.

Errors and exceptions
---------------------

Anything that goes wrong at the protocol layer raises
an :class:`openmv.OMVException` or one of its
subclasses (:class:`~openmv.TimeoutException`,
:class:`~openmv.ChecksumException`,
:class:`~openmv.SequenceException`). Wrapping the
``with`` block in ``try`` / ``except OMVException`` is
the simplest way to surface a disconnected USB cable or
a cam that stopped responding.

The protocol retries internally before raising; by the
time an :class:`OMVException` reaches the application,
the retry budget is gone and the link is genuinely
broken. The defaults (``max_retry=3``, ``timeout=1.0``)
work for everyone -- tune them at the constructor only
if a specific application needs different behaviour.
