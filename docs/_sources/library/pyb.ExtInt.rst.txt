.. currentmodule:: pyb
.. _pyb.ExtInt:

class ExtInt -- configure I/O pins to interrupt on external events
==================================================================

The STM32 has 22 external interrupt lines: lines 0-15 are routed from GPIO
pins, and lines 16-21 are tied to internal sources (RTC alarm, RTC wakeup,
USB wakeup, etc.). Each GPIO line *N* can be driven by pin *PxN* on any one
GPIO port at a time -- for example line 0 may map to ``PA0``, ``PB0``,
``PC0``, etc.

Example::

    def callback(line):
        print("line =", line)

    extint = pyb.ExtInt(pin, pyb.ExtInt.IRQ_FALLING, pyb.Pin.PULL_UP, callback)

Every falling edge on ``pin`` then invokes ``callback``. ``ExtInt``
automatically configures the GPIO line as an input; you do not need to do
that yourself.

.. note::

   Mechanical pushbuttons "bounce" and a single press or release often
   generates multiple edges. See for example
   `this debouncing primer
   <http://www.eng.utah.edu/~cs5780/debouncing.pdf>`__ for techniques.

Registering two callbacks on the same pin raises an exception.

If ``pin`` is passed as an integer, it is assumed to identify one of the
internal interrupt lines and must be in the range ``16``-``21``. Any other
pin value is resolved through the standard pin mapper.

In addition to the ``IRQ_*`` modes there are ``EVT_RISING``, ``EVT_FALLING``
and ``EVT_RISING_FALLING`` event modes that route a transition to the
processor's event input (used with the ``WFE`` instruction for low-power
wait). The ``EVT_*`` modes do not invoke the Python callback and are
intended for sleep / power-management use; the ``IRQ_*`` modes are what
ordinary application code should use.

A C-level API is also provided so internal drivers can claim EXTI lines;
see ``extint.h`` in the firmware source.


Constructors
------------

.. class:: ExtInt(pin: Union[int, str, Pin], mode: int, pull: int, callback: Callable[[int], None])

   Create an ``ExtInt`` object.

   - ``pin`` -- the pin to enable the interrupt on. May be a :class:`Pin`
     object, a pin-name string, or an integer in the range ``16``-``21`` to
     select an internal interrupt source.
   - ``mode`` -- the trigger mode. One of:

     .. list-table::
        :header-rows: 1
        :widths: 36 64

        * - Constant
          - Trigger
        * - :data:`ExtInt.IRQ_RISING`
          - Rising edge.
        * - :data:`ExtInt.IRQ_FALLING`
          - Falling edge.
        * - :data:`ExtInt.IRQ_RISING_FALLING`
          - Either rising or falling edge.

   - ``pull`` -- the pin pull configuration. One of
     :data:`pyb.Pin.PULL_NONE`, :data:`pyb.Pin.PULL_UP` or
     :data:`pyb.Pin.PULL_DOWN`.
   - ``callback`` -- callable invoked on the trigger. Must accept exactly
     one argument: the EXTI line number that fired.


   Class methods
   -------------

   .. classmethod:: regs() -> None

      Dump the contents of the EXTI peripheral registers (for debugging).


   Methods
   -------

   .. method:: disable() -> None

      Disable the interrupt associated with this ``ExtInt`` object. Useful
      for software debouncing.

   .. method:: enable() -> None

      Re-enable an interrupt previously disabled with :meth:`disable`.

   .. method:: line() -> int

      Return the EXTI line number this object is mapped to.

   .. method:: swint() -> None

      Trigger the callback from software (as if the configured edge had
      occurred on the line).


   Constants
   ---------

   .. data:: IRQ_FALLING
      :type: int

      Interrupt on a falling edge.

   .. data:: IRQ_RISING
      :type: int

      Interrupt on a rising edge.

   .. data:: IRQ_RISING_FALLING
      :type: int

      Interrupt on a rising or falling edge.
