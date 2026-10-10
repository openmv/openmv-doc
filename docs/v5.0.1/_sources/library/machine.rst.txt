:mod:`machine` --- functions related to the hardware
====================================================

.. module:: machine
   :synopsis: functions related to the hardware

The ``machine`` module contains specific functions related to the hardware
on a particular board. Most functions in this module allow to achieve direct
and unrestricted access to and control of hardware blocks on a system
(like CPU, timers, buses, etc.).

Memory access
-------------

The module exposes three subscriptable objects used for raw memory access.
Each behaves like a sparse array indexed by byte address: ``value = memN[addr]``
reads, ``memN[addr] = value`` writes. The address is always a byte address,
regardless of the access width.

.. data:: mem8

   Subscriptable 8-bit memory accessor. ``mem8[addr]`` reads an ``int`` in the
   range 0-255 from the byte at ``addr``; ``mem8[addr] = value`` writes the
   low 8 bits of ``value``. ``addr`` must be aligned to 1 byte (any address).

.. data:: mem16

   Subscriptable 16-bit (halfword) memory accessor. ``mem16[addr]`` reads an
   ``int`` in the range 0-65535; ``mem16[addr] = value`` writes the low 16
   bits. ``addr`` must be aligned to 2 bytes.

.. data:: mem32

   Subscriptable 32-bit (word) memory accessor. ``mem32[addr]`` reads an
   ``int`` in the range 0-0xFFFFFFFF; ``mem32[addr] = value`` writes the low
   32 bits. ``addr`` must be aligned to 4 bytes.

Example use (registers are specific to an STM32H7 microcontroller --
on the OpenMV Cam H7 / H7 Plus / Pure Thermal the header pin ``P0``
is wired to ``PB15``):

.. code-block:: python3

    import machine
    from micropython import const

    GPIOB = const(0x58020400)
    GPIO_BSRR = const(0x18)
    GPIO_IDR = const(0x10)

    # set P0 (PB15) high via the GPIOB bit-set/reset register
    machine.mem32[GPIOB + GPIO_BSRR] = 1 << 15

    # read P0 (PB15) directly out of the GPIOB input-data register
    value = (machine.mem32[GPIOB + GPIO_IDR] >> 15) & 1

Reset related functions
-----------------------

.. function:: reset() -> None

   :ref:`Hard resets <hard_reset>` the device in a manner similar to pushing the
   external RESET button.

.. function:: soft_reset() -> None

   Performs a :ref:`soft reset <soft_reset>` of the interpreter, deleting all
   Python objects and resetting the Python heap.

.. function:: reset_cause() -> int

   Get the reset cause. See :ref:`constants <machine_constants>` for the possible return values.

.. function:: bootloader(value: int | None = None, /) -> NoReturn

   Reset the camera into its DFU / serial-download bootloader, ready
   to be re-flashed with new firmware. This call never returns; the
   board reboots straight into the bootloader.

   The ``value`` argument is accepted for cross-port compatibility
   but is ignored on every OpenMV-supported board.

Interrupt related functions
---------------------------

The following functions allow control over interrupts.  Some systems require
interrupts to operate correctly so disabling them for long periods may
compromise core functionality, for example watchdog timers may trigger
unexpectedly.  Interrupts should only be disabled for a minimum amount of time
and then re-enabled to their previous state.  For example::

    import machine

    # Disable interrupts
    state = machine.disable_irq()

    # Do a small amount of time-critical work here

    # Enable interrupts
    machine.enable_irq(state)

.. function:: disable_irq() -> int

   Disable interrupt requests.
   Returns the previous IRQ state which should be considered an opaque value.
   This return value should be passed to the `enable_irq()` function to restore
   interrupts to their original state, before `disable_irq()` was called.

.. function:: enable_irq(state: int) -> None

   Re-enable interrupt requests.
   The *state* parameter should be the value that was returned from the most
   recent call to the `disable_irq()` function.

Power related functions
-----------------------

.. function:: freq(hz: int | None = None, /) -> int | tuple[int, ...]

    Return the MCU clock frequencies.

    On the STM32 ports (every OpenMV Cam M4/M7/H7/H7+/PT/N6 and the
    Arduino-branded variants) the return value is a tuple of the
    internal clocks in Hz. On the STM32N6 (OpenMV Cam N6) the tuple
    is ``(CPUCLK, SYSCLK, HCLK, PCLK1, PCLK2, PCLK4, PCLK5)``; on the
    other STM32 cams it is ``(SYSCLK, HCLK, PCLK1, PCLK2)``.

    On the mimxrt port (OpenMV Cam RT1062) and the alif port
    (OpenMV Cam AE3) the return value is a single integer -- the CPU
    frequency in Hz.

    Calling ``freq(hz)`` to set the clock raises ``NotImplementedError``
    on every OpenMV-supported board.

.. function:: idle() -> None

   Gates the clock to the CPU, useful to reduce power consumption at any time
   during short or long periods. Peripherals continue working and execution
   resumes as soon as any interrupt is triggered, or at most one millisecond
   after the CPU was paused.

   It is recommended to call this function inside any tight loop that is
   continuously checking for an external change (i.e. polling). This will reduce
   power consumption without significantly impacting performance. To reduce
   power consumption further then see the :func:`lightsleep`,
   :func:`time.sleep()` and :func:`time.sleep_ms()` functions.

.. function:: sleep() -> None

   .. note:: This function is deprecated, use :func:`lightsleep()` instead with no arguments.

.. function:: lightsleep(time_ms: int | None = None, /) -> None

   Stop execution and enter a low-power state with full RAM and
   peripheral retention. The MCU clock is gated; when the function
   returns, execution resumes from the point :func:`lightsleep` was
   called with every subsystem still operational.

   If ``time_ms`` is specified it is the maximum sleep duration in
   milliseconds. With or without a timeout, execution may resume
   early if any configured wake source fires (a :class:`Pin` IRQ, an
   :class:`RTC` alarm, an enabled peripheral interrupt, ...). Wake
   sources must be set up *before* the call.

   Power saving is more modest than :func:`deepsleep` but the
   wake-up is instantaneous and no state is lost.

.. function:: deepsleep(time_ms: int | None = None, /) -> NoReturn

   Stop execution and enter the deepest available low-power state.
   RAM contents, peripheral state and network connections may all be
   lost. When the MCU wakes it boots from the start of the main
   script, similar to a power-on or hard reset; :func:`reset_cause`
   will then return :data:`DEEPSLEEP_RESET` so the script can
   distinguish a deepsleep wake from other reset causes.

   If ``time_ms`` is specified the MCU schedules a wake-up after
   that many milliseconds (or sooner, if another configured wake
   source fires first). Pass nothing to sleep until an external
   wake source triggers.

   This call never returns -- handle resumed execution at the top of
   the main script, gated on :func:`reset_cause`.

Miscellaneous functions
-----------------------

.. function:: unique_id() -> bytes

   Return a ``bytes`` object containing a unique identifier for this
   board. The value is read out of the MCU's hardware (typically the
   factory-programmed device serial number), so it is stable across
   reboots and differs from one board to the next.

   The length depends on the MCU family -- 12 bytes on STM32, 8
   bytes on the mimxrt and alif ports. If your application needs a
   fixed-length ID, slice or hash the returned value.

.. function:: time_pulse_us(pin: Pin, pulse_level: int, timeout_us: int = 1000000, /) -> int

   Measure the width of a single pulse on ``pin`` and return its
   duration in microseconds.

   ``pin`` must be configured as a digital input.

   ``pulse_level`` is the pulse polarity to time: ``1`` for a high
   pulse, ``0`` for a low pulse.

   The function works in two phases. First, if the pin is not
   already at ``pulse_level``, it waits for the pin to transition to
   ``pulse_level`` (the start of the pulse). Then it measures the
   time the pin stays at ``pulse_level`` before transitioning back
   (the end of the pulse). The measured time is returned in
   microseconds.

   ``timeout_us`` bounds *each* phase independently (so a worst-case
   call lasts up to ``2 * timeout_us``). On timeout the function
   returns a negative value identifying which phase timed out:

      * ``-2`` -- timed out waiting for the leading edge (the pin
        never reached ``pulse_level``).
      * ``-1`` -- timed out waiting for the trailing edge (the pulse
        was longer than ``timeout_us``).

.. function:: bitstream(pin: Pin, encoding: int, timing: tuple, data: bytes, /) -> None

   Transmits *data* by bit-banging the specified *pin*. The *encoding* argument
   specifies how the bits are encoded, and *timing* is an encoding-specific timing
   specification.

   The supported encodings are:

     - ``0`` for "high low" pulse duration modulation. This will transmit 0 and
       1 bits as timed pulses, starting with the most significant bit.
       The *timing* must be a four-tuple of nanoseconds in the format
       ``(high_time_0, low_time_0, high_time_1, low_time_1)``. For example,
       ``(400, 850, 800, 450)`` is the timing specification for WS2812 RGB LEDs
       at 800kHz.

   Timing accuracy is hardware-dependent; faster MCUs produce
   tighter pulses (typically tens of nanoseconds).

   .. note:: For controlling WS2812 / NeoPixel strips, see the :mod:`neopixel`
      module for a higher-level API.

.. _machine_constants:

Constants
---------

The constants below are returned by :func:`reset_cause` and identify
why the MCU last reset. Available on the STM32 and mimxrt ports;
the alif port (OpenMV Cam AE3) does not currently expose reset-cause
constants and its :func:`reset_cause` always returns ``0``.

.. data:: PWRON_RESET
   :type: int

   Reset caused by power being applied to the chip. STM32 and
   mimxrt ports.

.. data:: WDT_RESET
   :type: int

   Reset caused by the watchdog timer expiring. STM32 and mimxrt
   ports.

.. data:: SOFT_RESET
   :type: int

   Reset caused by :func:`soft_reset` (the Python interpreter
   restarted without a hardware reset). STM32 and mimxrt ports.

.. data:: HARD_RESET
   :type: int

   Reset caused by the NRST pin being asserted (external reset
   button). STM32 ports only.

.. data:: DEEPSLEEP_RESET
   :type: int

   Reset caused by waking from deep-sleep. STM32 ports only.

Classes
-------

.. toctree::
   :maxdepth: 1

   machine.Pin.rst
   machine.Signal.rst
   machine.LED.rst
   machine.ADC.rst
   machine.PWM.rst
   machine.UART.rst
   machine.SPI.rst
   machine.I2C.rst
   machine.I2CTarget.rst
   machine.I2S.rst
   machine.CAN.rst
   machine.RTC.rst
   machine.Timer.rst
   machine.WDT.rst
   machine.SDCard.rst
   machine.Counter.rst
   machine.Encoder.rst
