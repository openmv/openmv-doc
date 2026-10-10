.. currentmodule:: pyb
.. _pyb.Pin:

class Pin -- control I/O pins
=============================

A :class:`Pin` object represents a single GPIO on the STM32. It
provides methods to configure the pin's mode (input, output,
alternate function, analog) and pull resistors, and to read or drive
its digital level. For analog sampling see :class:`pyb.ADC`; for
alternate-function enumeration see :class:`PinAF`.

All header pins are predefined as ``pyb.Pin.board.<name>``. Most
STM32 OpenMV Cams expose the I/O header pins ``P0`` ... ``P9``; the
OpenMV Cam N6 exposes additional pins up to ``P18``::

    p0 = pyb.Pin.board.P0
    g = pyb.Pin(pyb.Pin.board.P0, pyb.Pin.IN)

The underlying STM32 port/pin can also be addressed directly through
``pyb.Pin.cpu.<name>``, named as the port letter followed by the pin
number (for example ``pyb.Pin.cpu.A0``). The mapping of each OpenMV
header pin to a CPU pin is fixed by the board.

Pins may also be selected by string name::

    g = pyb.Pin("P0", pyb.Pin.OUT_PP)

User-defined names can be added with :meth:`Pin.dict`::

    MyMapperDict = {"LeftMotorDir": pyb.Pin.cpu.A0}
    pyb.Pin.dict(MyMapperDict)
    g = pyb.Pin("LeftMotorDir", pyb.Pin.OUT_OD)

and queried back::

    pin = pyb.Pin("LeftMotorDir")

Alternatively, a custom mapping function can be installed with
:meth:`Pin.mapper`::

    def MyMapper(pin_name):
        if pin_name == "LeftMotorDir":
            return pyb.Pin.cpu.A0

    pyb.Pin.mapper(MyMapper)

so a call to ``pyb.Pin("LeftMotorDir", pyb.Pin.OUT_PP)`` passes
``"LeftMotorDir"`` directly to the mapper.

The following order determines how a name gets mapped to a physical
pin:

1. A :class:`Pin` object is passed directly.
2. The user-supplied mapper function returns a pin.
3. The user-supplied dictionary contains a matching key.
4. The string matches a board pin name (``P0``, ``P1``, ...).
5. The string matches a CPU port/pin name (``A0``, ``B7``, ...).

Call ``pyb.Pin.debug(True)`` to print diagnostic information about
how each object is mapped to a pin.

Constructors
------------

.. class:: Pin(id: Union[str, Pin], *args, **kwargs)

   Create a new Pin object associated with the given ``id``. If additional
   arguments are given they are forwarded to :meth:`Pin.init` to configure
   the pin.

   Class methods
   -------------

   .. classmethod:: debug(state: Optional[bool] = None) -> Optional[bool]

      Get or set the debugging state (``True`` or ``False`` for on or off).

   .. classmethod:: dict(dict: Optional[dict] = None) -> Optional[dict]

      Get or set the pin mapper dictionary.

   .. classmethod:: mapper(fun: Optional[Callable[[str], Pin]] = None) -> Optional[Callable[[str], Pin]]

      Get or set the pin mapper function.


   Methods
   -------

   .. method:: init(mode: int, pull: int = Pin.PULL_NONE, *, value: Optional[int] = None, alt: Union[int, str] = -1) -> None

      Initialise the pin:

        - *mode* can be one of:

           - ``Pin.IN`` - configure the pin for input;
           - ``Pin.OUT_PP`` - configure the pin for output, with push-pull control;
           - ``Pin.OUT_OD`` - configure the pin for output, with open-drain control;
           - ``Pin.ALT`` - configure the pin for alternate function, input or output;
           - ``Pin.AF_PP`` - configure the pin for alternate function, push-pull;
           - ``Pin.AF_OD`` - configure the pin for alternate function, open-drain;
           - ``Pin.ANALOG`` - configure the pin for analog.

        - *pull* can be one of:

           - ``Pin.PULL_NONE`` - no pull up or down resistors;
           - ``Pin.PULL_UP`` - enable the pull-up resistor;
           - ``Pin.PULL_DOWN`` - enable the pull-down resistor.

          When a pin has the ``Pin.PULL_UP`` or ``Pin.PULL_DOWN`` pull-mode
          enabled, that pin is pulled to 3V3 or GND respectively through an
          internal resistor (typically tens of kOhm -- see the electrical
          characteristics in the STM32 datasheet for the OpenMV Cam in use).

        - *value* if not None will set the port output value before enabling the pin.

        - *alt* can be used when mode is ``Pin.ALT``, ``Pin.AF_PP`` or
          ``Pin.AF_OD`` to set the index or name of one of the alternate
          functions associated with a pin. This argument was previously
          called ``af`` which can still be used if needed.

   .. method:: value(value: Optional[Any] = None) -> Optional[int]

      Get or set the digital logic level of the pin:

        - With no argument, return 0 or 1 depending on the logic level of the pin.
        - With ``value`` given, set the logic level of the pin.  ``value`` can be
          anything that converts to a boolean.  If it converts to ``True``, the pin
          is set high, otherwise it is set low.

   .. method:: __str__() -> str

      Return a string describing the pin object.

   .. method:: af() -> int

      Returns the currently configured alternate-function of the pin. The
      integer returned will match one of the allowed constants for the af
      argument to the init function.

   .. method:: af_list() -> List[PinAF]

      Returns an array of alternate functions available for this pin.

   .. method:: gpio() -> int

      Returns the base address of the GPIO block associated with this pin.

   .. method:: mode() -> int

      Returns the currently configured mode of the pin. The integer returned
      will match one of the allowed constants for the mode argument to the init
      function.

   .. method:: name() -> str

      Get the pin name.

   .. method:: names() -> List[str]

      Returns the cpu and board names for this pin.

   .. method:: pin() -> int

      Get the pin number.

   .. method:: port() -> int

      Get the pin port.

   .. method:: pull() -> int

       Returns the currently configured pull of the pin. The integer returned
       will match one of the allowed constants for the pull argument to the init
       function.

   Constants
   ---------

   .. data:: IN
      :type: int

      Configure the pin as a digital input (high-impedance).

   .. data:: OUT_PP
      :type: int

      Configure the pin as a digital output with a push-pull driver.

   .. data:: OUT_OD
      :type: int

      Configure the pin as a digital output with an open-drain driver.

   .. data:: ANALOG
      :type: int

      Configure the pin as an analog input (e.g. for use with :class:`ADC`).

   .. data:: ALT
      :type: int

      Configure the pin as an alternate function (input or output).

   .. data:: AF_PP
      :type: int

      Configure the pin as an alternate function with a push-pull driver.

   .. data:: AF_OD
      :type: int

      Configure the pin as an alternate function with an open-drain driver.

   .. data:: PULL_NONE
      :type: int

      Disable both pull-up and pull-down resistors on the pin.

   .. data:: PULL_UP
      :type: int

      Enable the internal pull-up resistor on the pin.

   .. data:: PULL_DOWN
      :type: int

      Enable the internal pull-down resistor on the pin.
