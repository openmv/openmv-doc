.. currentmodule:: pyb
.. _pyb.ExtInt:

class ExtInt -- configure I/O pins to interrupt on external events
==================================================================

STM32 MCUs split the external interrupt controller (EXTI) into two
ranges: lines 0-15 are driven from GPIO pins, and the lines above 15 are
tied to internal sources (RTC alarm, RTC wakeup, USB wakeup, etc.). The
total line count and the mapping of internal lines above 15 are
MCU-specific; consult the EXTI section of the reference manual for the
OpenMV Cam's MCU for the exact assignments.

Each GPIO line *N* can be driven by pin *PxN* on any one GPIO port at a
time -- for example line 0 may map to ``PA0``, ``PB0``, ``PC0`` or any
other port-A through port-K pin 0, but only one at a time.

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

If ``pin`` is passed as an integer it is assumed to identify one of the
internal interrupt lines and must be ``>= 16`` and below the MCU's total
EXTI line count. Any other pin value is resolved through the standard
pin mapper.

In addition to the ``IRQ_*`` modes there are ``EVT_RISING``, ``EVT_FALLING``
and ``EVT_RISING_FALLING`` event modes that route a transition to the
processor's event input (used with the ``WFE`` instruction for low-power
wait). The ``EVT_*`` modes do not invoke the Python callback and are
intended for sleep / power-management use; ordinary application code
should use the ``IRQ_*`` modes.


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

   .. data:: IRQ_RISING
      :type: int

      Trigger an interrupt on a rising edge. The Python callback runs.

   .. data:: IRQ_FALLING
      :type: int

      Trigger an interrupt on a falling edge. The Python callback runs.

   .. data:: IRQ_RISING_FALLING
      :type: int

      Trigger an interrupt on either edge. The Python callback runs.

   .. data:: EVT_RISING
      :type: int

      Route a rising edge to the Cortex event input. No Python callback
      is invoked; intended for use with the ``WFE`` instruction in
      low-power code.

   .. data:: EVT_FALLING
      :type: int

      Route a falling edge to the Cortex event input. No Python callback
      is invoked.

   .. data:: EVT_RISING_FALLING
      :type: int

      Route either edge to the Cortex event input. No Python callback
      is invoked.
