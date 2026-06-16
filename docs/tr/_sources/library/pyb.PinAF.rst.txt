.. currentmodule:: pyb
.. _pyb.PinAF:

class PinAF -- pin alternate functions
======================================

Each STM32 pin can serve as plain GPIO or as one of several
peripheral alternate functions (``UART4_TX``, ``I2C2_SCL``,
``TIM2_CH3``, etc.). A :class:`PinAF` object describes a single
alternate function that is wired to a particular pin, and is what
:meth:`Pin.af_list` returns.

Usage Model::

    p4 = pyb.Pin.board.P4
    p4_af = p4.af_list()

``p4_af`` now holds the list of :class:`PinAF` objects available on
``P4``. The exact list depends on the STM32 MCU on the OpenMV Cam in
use.

Normally each peripheral driver configures the alternate function it
needs automatically. When the same peripheral function is wired to
more than one pin, or several functions share a pin, you can pick one
explicitly through ``Pin.ALT`` either by name::

   pin = pyb.Pin(pyb.Pin.board.P4, mode=pyb.Pin.ALT, alt=pyb.Pin.AF1_TIM2)

or by raw index::

   pin = pyb.Pin(pyb.Pin.board.P4, mode=pyb.Pin.ALT, alt=1)

Constructors
------------

.. class:: PinAF

   :class:`PinAF` objects are not constructed directly. Use
   :meth:`Pin.af_list` to enumerate the alternate functions available
   on a given pin.

   Methods
   -------

   .. method:: __str__() -> str

      Return a string describing the alternate function (its name and
      index).

   .. method:: index() -> int

      Return the alternate-function index. The same integer is
      accepted by the ``alt`` argument of :meth:`Pin.init`.

   .. method:: name() -> str

      Return the name of the alternate function, for example
      ``"TIM2_CH3"``.

   .. method:: reg() -> int

      Return the base register address of the peripheral assigned to
      this alternate function. For example, if the alternate function
      were ``TIM2_CH3`` this would return :data:`stm.TIM2`.
