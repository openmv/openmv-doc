:mod:`pyb` --- functions related to the board
=============================================

.. module:: pyb
   :synopsis: functions related to the board

.. warning::

   **The pyb module is deprecated.** Use the cross-port :mod:`machine`
   module for new code -- it provides the same functionality on every
   OpenMV Cam regardless of MCU family, whereas ``pyb`` exists only on
   the STM32-based boards. ``pyb`` is retained for backwards compatibility
   with older scripts, no new features will be added, and it may be
   removed in a future release.

The ``pyb`` module contains STM32-specific functions related to the board.

Time related functions
----------------------

.. function:: delay(ms: int) -> None

   Delay for the given number of milliseconds.

.. function:: udelay(us: int) -> None

   Delay for the given number of microseconds.

.. function:: millis() -> int

   Returns the number of milliseconds since the board was last reset.

   The result is always a MicroPython smallint (31-bit signed number), so
   after 2^30 milliseconds (about 12.4 days) this will start to return
   negative numbers.

   Note that if :meth:`pyb.stop()` is issued the hardware counter supporting this
   function will pause for the duration of the "sleeping" state. This
   will affect the outcome of :meth:`pyb.elapsed_millis()`.

.. function:: micros() -> int

   Returns the number of microseconds since the board was last reset.

   The result is always a MicroPython smallint (31-bit signed number), so
   after 2^30 microseconds (about 17.8 minutes) this will start to return
   negative numbers.

   Note that if :meth:`pyb.stop()` is issued the hardware counter supporting this
   function will pause for the duration of the "sleeping" state. This
   will affect the outcome of :meth:`pyb.elapsed_micros()`.

.. function:: elapsed_millis(start: int) -> int

   Returns the number of milliseconds which have elapsed since ``start``.

   This function takes care of counter wrap, and always returns a positive
   number. This means it can be used to measure periods up to about 12.4 days.

   Example::

       start = pyb.millis()
       while pyb.elapsed_millis(start) < 1000:
           # Perform some operation

.. function:: elapsed_micros(start: int) -> int

   Returns the number of microseconds which have elapsed since ``start``.

   This function takes care of counter wrap, and always returns a positive
   number. This means it can be used to measure periods up to about 17.8 minutes.

   Example::

       start = pyb.micros()
       while pyb.elapsed_micros(start) < 1000:
           # Perform some operation
           pass

Reset related functions
-----------------------

.. function:: hard_reset() -> None

   Resets the OpenMV Cam in a manner similar to pushing the external RESET
   button.

.. function:: bootloader() -> None

   Reset into OpenMV's own USB DFU bootloader, ready for a firmware
   update. This is the recommended way to invoke DFU from running code
   -- no BOOT pin needs to be asserted at reset.

   Not available on the OpenMV Cam N6 (the ``pyb`` legacy compatibility
   layer is disabled on that board); use :func:`machine.bootloader`
   instead.

.. function:: fault_debug(value: bool) -> None

   Enable or disable hard-fault debugging.  A hard-fault is when there is a fatal
   error in the underlying system, like an invalid memory access.

   If the *value* argument is ``False`` then the board will automatically reset if
   there is a hard fault.

   If *value* is ``True`` then, when the board has a hard fault, it will print the
   registers and the stack trace, and then cycle the LEDs indefinitely.

   The default value is disabled, i.e. to automatically reset.

Interrupt related functions
---------------------------

.. function:: disable_irq() -> bool

   Disable interrupt requests.
   Returns the previous IRQ state: ``False``/``True`` for disabled/enabled IRQs
   respectively.  This return value can be passed to enable_irq to restore
   the IRQ to its original state.

.. function:: enable_irq(state: bool = True) -> None

   Enable interrupt requests.
   If ``state`` is ``True`` (the default value) then IRQs are enabled.
   If ``state`` is ``False`` then IRQs are disabled.  The most common use of
   this function is to pass it the value returned by ``disable_irq`` to
   exit a critical section.

.. function:: freq(sysclk: Optional[int] = None, hclk: Optional[int] = None, pclk1: Optional[int] = None, pclk2: Optional[int] = None) -> Optional[Tuple[int, int, int, int]]

   If given no arguments, returns a tuple of clock frequencies
   ``(sysclk, hclk, pclk1, pclk2)`` in hertz:

   .. list-table::
      :header-rows: 1
      :widths: 18 82

      * - Field
        - Meaning
      * - ``sysclk``
        - CPU frequency
      * - ``hclk``
        - AHB bus, core memory and DMA frequency
      * - ``pclk1``
        - APB1 bus frequency
      * - ``pclk2``
        - APB2 bus frequency

   If given any arguments then the function sets the CPU frequency (and
   bus frequencies if additional arguments are supplied). Frequencies are
   in hertz; the largest supported frequency not greater than the given
   value is selected. The set of valid ``sysclk`` frequencies and the
   maximum ``hclk`` / ``pclk1`` / ``pclk2`` values depend on the MCU --
   refer to the relevant STM32 reference manual for the OpenMV Cam in
   use. The bus frequencies are derived from ``sysclk`` via prescalers
   the driver picks to best match the requested values.

   .. warning::

      Changing the frequency while USB is enabled may make USB
      unreliable. Change it from :ref:`boot.py`, before the USB
      peripheral is started, and do not select a ``sysclk`` value too
      low for the USB clock requirements of the MCU.

Power related functions
-----------------------

.. function:: wfi() -> None

   Wait for an internal or external interrupt.

   This executes a ``wfi`` instruction which reduces power consumption
   of the MCU until any interrupt occurs (be it internal or external),
   at which point execution continues.  Note that the system-tick interrupt
   occurs once every millisecond (1000Hz) so this function will block for
   at most 1ms.

.. function:: stop() -> None

   Put the OpenMV Cam into the STM32 *stop* low-power state. Execution
   continues from this point on wake-up. Wake-up requires an external
   interrupt or a real-time-clock event; see :meth:`pyb.RTC.wakeup` to
   configure one. The exact achievable current draw depends on the
   board and on which peripherals are left clocked.

.. function:: standby() -> None

   Put the OpenMV Cam into the STM32 *standby* deep-sleep state. This
   is the lowest power-down level; the device exits via a hard reset
   when woken, so execution does not resume in place. Wake-up requires
   a real-time-clock event; see :meth:`pyb.RTC.wakeup` to configure
   one. The exact achievable current draw depends on the board.

Miscellaneous functions
-----------------------

.. function:: have_cdc() -> bool

   Return True if USB is connected as a serial device, False otherwise.

   .. note:: This function is deprecated.  Use pyb.USB_VCP().isconnected() instead.

.. function:: hid(data: Tuple[int, int, int, int]) -> None

   Takes a 4-tuple (or list) and sends it to the USB host (the PC) to
   signal a HID mouse-motion event.

   .. note:: This function is deprecated.  Use :meth:`pyb.USB_HID.send()` instead.

.. function:: info(dump_alloc_table: Optional[bool] = None) -> None

   Print out lots of information about the board.

.. function:: main(filename: str) -> None

   Set the filename of the main script to run after :ref:`boot.py` is finished.
   If this function is not called then the default file :ref:`main.py` will be
   executed.

   It only makes sense to call this function from within boot.py.

.. function:: mount(device: Any, mountpoint: str, *, readonly: bool = False, mkfs: bool = False) -> None

   .. note::

      This function is deprecated. Use :func:`vfs.mount` / :func:`vfs.umount`
      and a :class:`vfs.AbstractBlockDev`-derived block device instead.

   Mount a block device under ``mountpoint``. ``device`` must implement the
   legacy pyb block-device protocol (also deprecated -- see
   :class:`vfs.AbstractBlockDev` for the modern interface):

   .. list-table::
      :header-rows: 1
      :widths: 38 62

      * - Method
        - Purpose
      * - ``readblocks(self, blocknum, buf)``
        - Copy ``buf`` worth of bytes from the device starting at block
          ``blocknum``. ``buf`` length is a multiple of 512.
      * - ``writeblocks(self, blocknum, buf)`` *(optional)*
        - Write ``buf`` to the device starting at block ``blocknum``. If
          omitted, the device is mounted read-only.
      * - ``count(self)``
        - Return the number of 512-byte blocks on the device.
      * - ``sync(self)`` *(optional)*
        - Flush any cached writes.

   ``mountpoint`` is the path in the root of the filesystem to mount the
   device at; it must begin with a forward slash. ``readonly`` forces a
   read-only mount. ``mkfs`` creates a new filesystem if none is present.

.. function:: repl_uart(uart: Optional[UART] = None) -> Optional[UART]

   Get or set the UART object where the REPL is repeated on.

.. function:: rng() -> int

   Return a 30-bit hardware generated random number.

.. function:: sync() -> None

   Sync all file systems.

.. function:: unique_id() -> bytes

   Returns a string of 12 bytes (96 bits), which is the unique ID of the MCU.

.. function:: usb_mode(modestr: Optional[str] = None, port: int = -1, vid: int = 0xf055, pid: int = -1, msc: Tuple = (), hid: Tuple = pyb.hid_mouse, high_speed: bool = False) -> Optional[str]

   If called with no arguments, return the current USB mode as a string.

   If called with *modestr* provided, attempts to configure the USB mode.
   The following values of *modestr* are understood:

   .. list-table::
      :header-rows: 1
      :widths: 28 72

      * - *modestr*
        - Configures
      * - ``None``
        - Disables USB.
      * - ``'VCP'``
        - VCP (Virtual COM Port) only.
      * - ``'MSC'``
        - MSC (USB mass storage class) only.
      * - ``'VCP+MSC'``
        - VCP and MSC.
      * - ``'VCP+HID'``
        - VCP and HID (human interface device).
      * - ``'VCP+MSC+HID'``
        - VCP, MSC and HID together. Not supported on every OpenMV Cam.

   For backwards compatibility, ``'CDC'`` is understood to mean ``'VCP'``
   (and similarly for ``'CDC+MSC'`` and ``'CDC+HID'``).

   The *port* parameter should be an integer (0, 1, ...) and selects which
   USB port to use if the board supports multiple ports.  A value of -1 uses
   the default or automatically selected port.

   The *vid* and *pid* parameters allow you to specify the VID (vendor id)
   and PID (product id).  A *pid* value of -1 will select a PID based on the
   value of *modestr*.

   If enabling MSC mode, the *msc* parameter can be used to specify a list
   of SCSI LUNs to expose on the mass storage interface.  For example
   ``msc=(pyb.Flash(), pyb.SDCard())``.

   If enabling HID mode, you may also specify the HID details by
   passing the *hid* keyword parameter.  It takes a tuple of
   (subclass, protocol, max packet length, polling interval, report
   descriptor).  By default it will set appropriate values for a USB
   mouse.  There is also a ``pyb.hid_keyboard`` constant, which is an
   appropriate tuple for a USB keyboard.

   The *high_speed* parameter, when set to ``True``, enables USB HS mode if
   it is supported by the hardware.

Constants
---------

Both of the constants below are ready-made 5-tuples in the form

   ``(subclass, protocol, max_packet_size, polling_interval_ms, report_descriptor)``

suitable for passing as the ``hid`` argument of :func:`usb_mode` to make the
OpenMV Cam appear to the host as a USB HID device. ``subclass = 1`` means
"boot interface" and ``protocol`` selects the boot device class
(``1`` = keyboard, ``2`` = mouse). The fifth element is a ``bytes`` object
holding the HID report descriptor used when the host enumerates the device.

.. data:: pyb.hid_mouse
   :type: tuple

   Pre-built HID descriptor for a 3-button boot mouse with relative X/Y
   movement. The tuple is ``(1, 2, 4, 8, <mouse report descriptor>)``:
   boot subclass, mouse protocol, 4-byte input reports (button mask + X +
   Y + wheel), polled every 8 ms. The built-in report descriptor is the
   one used by ``pyb.USB_HID().send((buttons, dx, dy, wheel))``.

.. data:: pyb.hid_keyboard
   :type: tuple

   Pre-built HID descriptor for a USB boot keyboard. The tuple is
   ``(1, 1, 8, 8, <keyboard report descriptor>)``: boot subclass,
   keyboard protocol, 8-byte input reports (modifier byte, one reserved
   byte, six concurrent key codes), polled every 8 ms. The built-in
   report descriptor matches the standard 8-byte HID boot-keyboard
   layout, so the report sent via :meth:`USB_HID.send` should be a
   ``bytes`` of the form
   ``(modifiers, 0, key1, key2, key3, key4, key5, key6)``.

Classes
-------

.. toctree::
   :maxdepth: 1

   pyb.ADC.rst
   pyb.ADCAll.rst
   pyb.CAN.rst
   pyb.DAC.rst
   pyb.ExtInt.rst
   pyb.Flash.rst
   pyb.I2C.rst
   pyb.LED.rst
   pyb.Pin.rst
   pyb.PinAF.rst
   pyb.RTC.rst
   pyb.Servo.rst
   pyb.SPI.rst
   pyb.Timer.rst
   pyb.TimerChannel.rst
   pyb.UART.rst
   pyb.USB_HID.rst
   pyb.USB_VCP.rst
