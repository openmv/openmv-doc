Arduino Giga R1 WiFi
====================

The Arduino Giga R1 WiFi is a 101 × 53 mm Mega‑form‑factor maker
board built around the STMicroelectronics STM32H747XI — a dual‑core
SoC combining a Cortex‑M7 at 480 MHz with a Cortex‑M4 at 240 MHz.
The OpenMV firmware runs on the M7 core and turns the Giga into a
flexible vision platform: a dedicated 22‑pin Arducam camera flex
connector accepts a swappable image sensor, the Giga Display Shield
plugs into a MIPI‑DSI connector, an audio jack handles stereo I/O,
and 76 user pins on the Mega‑style headers leave plenty of room for
shields and external hardware.

.. image:: ../arduino-giga-r1-wifi-hero.jpg
    :alt: Arduino Giga R1 WiFi
    :width: 400px
    :align: center

For full datasheet, photos, and dimensions see the
`Arduino Giga R1 WiFi product page <https://store.arduino.cc/products/giga-r1-wifi>`_.

Highlights
----------

* **STMicroelectronics STM32H747XI** dual Cortex‑M7 (480 MHz) +
  Cortex‑M4 (240 MHz). OpenMV firmware runs on the M7 core only;
  the M4 core is exposed through :doc:`/library/openamp` for
  Inter‑Processor Communication.
* **8 MB external SDRAM** plus **2 MB internal flash** and **16 MB
  external QSPI flash** — enough headroom for full‑colour VGA
  framebuffers and large ROMFS assets.
* Hardware **JPEG encoder/decoder**.
* **22‑pin Arducam‑compatible camera flex connector** (``J6``)
  — driver support for **OV5640** (5 MP), **OV7670**, **GC2145**,
  **HM01B0**, and **HM0360** sensor modules.
* **MIPI‑DSI display connector** (``J5``) for the **Arduino Giga
  Display Shield** (480×800 capacitive touch panel) plus an LTDC
  RGB display engine for advanced carriers.
* **3.5 mm audio jack** with stereo line‑out and mic in.
* **Wi‑Fi b/g/n** (2.4 GHz) + **Bluetooth LE 5.1** via the Murata
  1DX (CYW4343W) module — uses the on‑board U.FL antenna connector
  with the supplied flexible antenna.
* **Two USB connectors**: USB‑C (full‑speed) for power / serial /
  programming, and a USB‑A Host port for keyboards, mice, USB sticks
  etc. (the host port can power devices but cannot power the board).
* **76 user I/O pins** on the Mega‑style headers — D0–D75 plus
  A0–A11. Twelve PWM outputs on D2–D13.
* **Battery support** — 3.7 V Li‑Po JST connector and on‑board
  charger.
* **OFF button** for soft‑power down, **RESET button**, and a
  ``VRTC`` pin for keeping the on‑chip RTC running off a CR2032
  while the board is otherwise unpowered.

Pinout
------

.. image:: ../pinout-arduino-giga-r1-wifi.png
    :alt: Arduino Giga R1 WiFi Pinout
    :width: 700px

Pin reference
-------------

The Giga R1 has more user pins than any other OpenMV‑supported
board — covering them all here would dwarf the rest of the doc.
The table below covers the **Mega inner row** (the most commonly
used pins) and the analog header. For the full mapping see Arduino's
official pinout PDF.

.. csv-table::
   :header: "Pin name", "Reference", "Function"
   :widths: 14, 12, 74

   "D0",         "3.3 V", "UART1 RX (Serial1) / PB7"
   "D1",         "3.3 V", "UART1 TX (Serial1) / PA9"
   "D2",         "3.3 V", "TIM2 CH4 PWM / PA3"
   "D3",         "3.3 V", "TIM2 CH3 PWM / PA2"
   "D4",         "3.3 V", "TIM8 CH1 PWM / PJ8"
   "D5",         "3.3 V", "TIM3 CH2 PWM / PA7"
   "D6",         "3.3 V", "TIM4 CH2 PWM / PD13"
   "D7",         "3.3 V", "TIM3 CH1 PWM / PB4"
   "D8",         "3.3 V", "TIM4 CH3 PWM / PB8"
   "D9",         "3.3 V", "TIM4 CH4 PWM / PB9"
   "D10",        "3.3 V", "GPIO / PK1 (TIM1 reserved for camera)"
   "D11",        "3.3 V", "GPIO / PJ10 (TIM1 reserved for camera)"
   "D12",        "3.3 V", "GPIO / PJ11 (TIM1 reserved for camera)"
   "D13",        "3.3 V", "TIM12 CH1 PWM / PH6 (= LED_BUILTIN)"
   "D14",        "3.3 V", "UART6 TX (Serial2) / PG14"
   "D15",        "3.3 V", "UART6 RX (Serial2) / PC7"
   "D16",        "3.3 V", "UART4 TX (Serial3) / PH13"
   "D17",        "3.3 V", "UART4 RX (Serial3) / PI9"
   "D18",        "3.3 V", "UART2 TX (Serial4) / PD5"
   "D19",        "3.3 V", "UART2 RX (Serial4) / PD6"
   "D20",        "3.3 V", "I2C2 SDA / PB11"
   "D21",        "3.3 V", "I2C2 SCL / PH4"
   "D101",       "3.3 V", "I2C4 SCL (= SCL1) / PB6"
   "D102",       "3.3 V", "I2C4 SDA (= SDA1) / PH12"
   "A0",         "3.3 V", "ADC1 channel 4 / PC4 (= D76)"
   "A1",         "3.3 V", "ADC1 channel 8 / PC5 (= D77)"
   "A2",         "3.3 V", "ADC1 channel 9 / PB0 (= D78)"
   "A3",         "3.3 V", "ADC1 channel 5 / PB1 (= D79)"
   "A4",         "3.3 V", "ADC1 channel 13 / PC3 (= D80)"
   "A5",         "3.3 V", "ADC1 channel 12 / PC2 (= D81)"
   "A6",         "3.3 V", "ADC1 channel 10 / PC0 (= D82)"
   "A7",         "3.3 V", "ADC1 channel 16 / PA0 (= D83)"
   "A8",         "1.8 V", "ADC3 channel 0 / PC2_C (analog only)"
   "A9",         "1.8 V", "ADC3 channel 1 / PC3_C (analog only)"
   "A10",        "1.8 V", "ADC2 channel 1 / PA1_C (analog only)"
   "A11",        "1.8 V", "ADC2 channel 0 / PA0_C (analog only)"
   "DAC0",       "3.3 V", "DAC1 OUT / PA4 (= D84)"
   "DAC1",       "3.3 V", "DAC1 OUT2 / PA5 (= D85)"
   "RESET",      "3.3 V", "press the on‑board RESET button or pull to GND to reset"
   "OFF",        "—",     "short to GND to power off the entire board"
   "VRTC",       "—",     "coin‑cell input for keeping the H7 RTC alive while powered off"
   "LED_RED",    "3.3 V", "RGB LED red channel (active low) / PI12"
   "LED_GREEN",  "3.3 V", "RGB LED green channel (active low) / PJ13"
   "LED_BLUE",   "3.3 V", "RGB LED blue channel (active low) / PE3"

D22–D75 fill the outer two rows of the Mega header; their primary
function is general‑purpose digital I/O, and many of them double as
camera, display, or DFSDM signals when those peripherals are in use
(e.g. D54–D75 are wired through to the camera connector ``J6``).

.. note::

   ``A8``–``A11`` are **analog‑only** pins on the STM32H747's ``_C``
   pads — they are 1.8 V referenced and have no GPIO peripheral.
   Driving 3.3 V into them will saturate the converter and may damage
   the pin.

Power pins
----------

* **+5V** — switched 5 V from USB / VIN, available to power external
  shields. Up to ~140 mA total across all I/Os.
* **VIN** — 6 – 24 V input. Powers the board through the on‑board
  buck regulator (the same rail as USB).
* **+3V3** — main 3.3 V rail.
* **IOREF** — reflects the I/O voltage of the board (3.3 V on the
  Giga R1).
* **GND** — common ground.
* **VBAT** (JST connector) — 3.7 V Li‑Po input. The on‑board charger
  tops it up from USB / VIN.
* **VRTC** — coin‑cell input for the on‑chip RTC.

The Giga R1 can be powered through any of three paths:

* **USB‑C** — supplies 5 V to the on‑board regulator.
* **VIN pin** — drive a regulated 6 – 24 V supply.
* **Li‑Po battery** — connect to the JST.

The **USB‑A Host** port on the side has a 500 mA current‑limited
power switch to source 5 V to attached devices, but cannot be used
to power the Giga itself.

Recovery and debug pins
-----------------------

* **RESET** — both an exposed pin and a momentary RESET button on
  the top of the board, tied to NRST.
* **BOOT0_BUTTON** — a second button that pulls BOOT0 high. Hold
  it while pressing RESET to enter the STM32H747 ROM bootloader for
  DFU‑based firmware update.
* **OFF** — short the OFF pad to GND to fully power down the board
  (the PMIC cuts the 3.3 V rail).

The Giga R1 supports two ways to enter DFU:

* **Double‑tap the RESET button** — Arduino's standard quick‑DFU
  shortcut.
* **Hold BOOT0 + press RESET** — for boards that have lost their
  bootloader entirely.

OpenMV IDE uses DFU to reflash the firmware in either case.

A running script can re‑enter the bootloader on demand by calling
:func:`machine.bootloader`::

    import machine

    machine.bootloader()

A 10‑pin **2.54 mm (100‑mil) JTAG / SWD header** is exposed on the
back of the board:

* SWDIO = PA13
* SWCLK = PA14
* RESET = NRST
* GND, +3.3 V

A separate 6‑pin **2.54 mm SPI header** breaks out **SPI1** (PG9
CIPO, PB3 SCK, PD7 COPI) for in‑system programmable shields. All
debug signals are 3.3 V referenced.

Onboard peripherals
-------------------

LEDs
~~~~

The Giga R1 has a single user RGB LED, software‑controllable through
:ref:`machine.LED <machine.LED>`. ``LED_BUILTIN`` aliases the green
channel, so blinking ``LED_BUILTIN`` and ``LED_GREEN`` controls the
same physical LED::

    from machine import LED

    LED("LED_RED").on()
    LED("LED_GREEN").on()
    LED("LED_BLUE").on()

Camera connector (J6)
~~~~~~~~~~~~~~~~~~~~~

``J6`` is a 22‑pin Arducam‑compatible camera flex connector. Plug
in any of the supported sensor modules (OV5640, OV7670, GC2145,
HM01B0, HM0360) and the firmware probes them automatically::

    import csi

    cam = csi.CSI()
    cam.reset()
    cam.pixformat(csi.RGB565)
    cam.framesize(csi.QVGA)
    cam.snapshot(time=2000)       # let auto‑exposure settle

    while True:
        img = cam.snapshot()

The OV5640 module on the Giga R1 has a voice‑coil autofocus
actuator. Trigger it with the :meth:`~csi.CSI.ioctl` API::

    cam.ioctl(csi.IOCTL_TRIGGER_AUTO_FOCUS)
    cam.ioctl(csi.IOCTL_WAIT_ON_AUTO_FOCUS, 5000)
    img = cam.snapshot()

Use :data:`~csi.IOCTL_PAUSE_AUTO_FOCUS` to freeze the lens at its
current position and :data:`~csi.IOCTL_RESET_AUTO_FOCUS` to return
to the factory default.

Machine learning
~~~~~~~~~~~~~~~~

:doc:`/library/omv.ml` runs quantised TFLite models on the Cortex‑M7
with **CMSIS‑NN** kernels — fast enough for compact detectors at a
few frames per second, and the 8 MB SDRAM gives plenty of room for
larger model weights. Models on the read‑only ``/rom`` filesystem
load directly from flash without copying to RAM. Here's a 128×128
BlazeFace detector overlaying the detected face and its six landmarks
on every frame::

    import csi
    import time
    import ml
    from ml.postprocessing.mediapipe import BlazeFace

    # Initialize the sensor.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.VGA)
    csi0.window((400, 400))

    # Load built-in face detection model
    model = ml.Model("/rom/blazeface_front_128.tflite", postprocess=BlazeFace(threshold=0.4))
    print(model)

    clock = time.clock()
    while True:
        clock.tick()
        img = csi0.snapshot()

        for r, score, keypoints in model.predict([img]):
            ml.utils.draw_predictions(img, [r], ("face",), ((0, 0, 255),), format=None)
            ml.utils.draw_keypoints(img, keypoints, color=(255, 0, 0))

        print(clock.fps(), "fps")

Display output (J5)
~~~~~~~~~~~~~~~~~~~

``J5`` is a MIPI‑DSI connector for the **Arduino Giga Display
Shield** — a 480×800 capacitive touch panel based on the ST7701
panel driver and the GT911 touch controller. Both drivers ship
frozen with the firmware. Use :doc:`/library/omv.display` to push
framebuffers and :class:`gt911.GT911` for touch input::

    import display
    from machine import I2C
    from gt911 import GT911

    lcd = display.DSIDisplay(
        framesize=display.FWVGA, portrait=True,
        refresh=60, controller=display.ST7701(),
    )
    lcd.write(my_image)

    # Touch on I²C 4 with reset/IRQ on PI2/PI1.
    touch = GT911(I2C(4, freq=400_000), reset_pin="PI2", irq_pin="PI1")

The LTDC RGB display engine is also available for advanced carriers
that wire up an RGB‑interface panel directly to the bottom HD signals.

Wi‑Fi
~~~~~

The on‑board Murata 1DX (CYW4343W) is exposed via
:doc:`/library/network` as a station interface. **Connect the
supplied antenna to the U.FL connector before bringing up the radio
— without an external antenna the Wi‑Fi will not work**::

    import network, time

    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect("ssid", "password")
    while not wlan.isconnected():
        time.sleep(1)
    print("Wi‑Fi IP:", wlan.ipconfig("addr4")[0])

Bluetooth
~~~~~~~~~

The same Murata 1DX also exposes Bluetooth LE 5.1. Use
:doc:`/library/aioble` for asyncio‑friendly BLE — for example,
advertise as a peripheral and wait for a central to connect::

    import asyncio
    import aioble

    async def run():
        while True:
            conn = await aioble.advertise(250_000, name="Giga-R1")
            print("Connected:", conn.device)
            await conn.disconnected()

    asyncio.run(run())

Bus reference
-------------

GPIO
~~~~

Use :ref:`machine.Pin <machine.Pin>` to read or drive any of the
silkscreened pins. Outputs are 3.3 V CMOS and can sink/source up to
20 mA per pin (140 mA total across the whole header).

::

    from machine import Pin

    out = Pin("D2", Pin.OUT)
    out.on()
    out.off()
    out.value(1)

    inp = Pin("D3", Pin.IN, Pin.PULL_UP)
    print(inp.value())

Any input pin can also fire an interrupt on edge transitions::

    def handler(pin):
        print("triggered:", pin)

    Pin("D3", Pin.IN, Pin.PULL_UP).irq(
        handler, Pin.IRQ_FALLING | Pin.IRQ_RISING,
    )

UART
~~~~

============  ====  ====  ===============
Bus           TX    RX    Arduino name
============  ====  ====  ===============
UART1         D1    D0    Serial1
UART6         D14   D15   Serial2
UART4         D16   D17   Serial3
UART2         D18   D19   Serial4
============  ====  ====  ===============

.. note::

   The ``machine.UART`` IDs above match the underlying STM32
   peripherals, not the Arduino "Serial" numbering. ``Serial0``
   (USB CDC) is the REPL.

::

    from machine import UART

    uart = UART(1, baudrate=115200)
    uart.write("hello")
    uart.read(5)

I²C
~~~

============  ====  ====
Bus           SCL   SDA
============  ====  ====
I2C2          D21   D20
I2C4          D101  D102
I2C1          D8    D9
============  ====  ====

::

    from machine import I2C

    i2c = I2C(2, freq=400_000)
    i2c.scan()
    i2c.writeto(0x76, b"hi")

Bus 2 (``D20``/``D21``, the silkscreened ``SDA``/``SCL`` pair) is
the default Arduino ``Wire`` bus. Bus 4 (``D101``/``D102``, the
inner row's ``SDA1``/``SCL1`` pair) is the camera control bus and is
shared with the camera sensor on the J6 connector. Bus 1 is on
``D8``/``D9`` if you need a third I²C and don't mind giving up
those pins as PWM outputs.

The same hardware can also be used in target (slave) mode through
:ref:`machine.I2CTarget <machine.I2CTarget>`::

    from machine import I2CTarget

    buf = bytearray(32)
    target = I2CTarget(2, addr=0x42, mem=buf)

SPI
~~~

The user SPI bus is exposed on a dedicated 6‑pin header on the back
of the board (not on the Mega digital row):

============  =====  =====  =====
Bus           MOSI   MISO   SCK
============  =====  =====  =====
SPI1          PD7    PG9    PB3
============  =====  =====  =====

The CS line is not driven by the SPI peripheral on this header —
configure any free GPIO as an output and toggle it manually around
the transfer::

    from machine import SPI
    from machine import Pin

    spi = SPI(1, baudrate=10_000_000)
    cs = Pin("D7", Pin.OUT, value=1)   # CS is not driven by the SPI peripheral

    cs.value(0)
    spi.write(b"hello")
    cs.value(1)

ADC
~~~

The Giga R1 exposes twelve 12‑bit ADC channels on **A0–A11**.
``A0``–``A7`` are 3.3 V referenced; ``A8``–``A11`` are 1.8 V
referenced (analog‑only ``_C`` pins, no GPIO peripheral)::

    from machine import ADC
    import time

    adc = ADC("A0")
    high_z = ADC("A8")        # 1.8 V referenced, very high input impedance

    while True:
        print("A0:", adc.read_u16() * 3.3 / 65535, "V")
        print("A8:", high_z.read_u16() * 1.8 / 65535, "V")
        time.sleep_ms(100)

.. warning::

   ``A8``–``A11`` are **1.8 V referenced** — driving a 3.3 V signal
   in will saturate the converter and may damage the pin. Divide
   higher voltages down externally.

DAC
~~~

Two 12‑bit DAC channels are exposed on **DAC0** (= **D84** /
**A12**, MCU pin PA4) and **DAC1** (= **D85** / **A13**, MCU pin
PA5) through :class:`pyb.DAC`::

    from pyb import DAC

    dac = DAC(1)
    dac.write(int(0.5 * 255))   # 8‑bit output, ~1.65 V

PWM
~~~

PWM is available on **D2–D13** (the inner Mega row marked with a
``~`` on the silkscreen). Each pin maps to a single TIM channel:

============  =====================
Pin           Timer / channel
============  =====================
D2            TIM2 CH4
D3            TIM2 CH3
D4            TIM8 CH1
D5            TIM3 CH2
D6            TIM4 CH2
D7            TIM3 CH1
D8            TIM4 CH3
D9            TIM4 CH4
D13           TIM12 CH1
============  =====================

Drive any of them via :ref:`machine.PWM <machine.PWM>`::

    from machine import Pin, PWM

    pwm = PWM(Pin("D2"), freq=1_000, duty_u16=32768)

.. note::

   **TIM1 is reserved by the firmware for the camera master clock**,
   so ``D4``/``D10``/``D11``/``D12`` (which only have TIM1 alt
   functions on this MCU) cannot be used for user PWM. ``D4``
   (PJ8) does have a TIM8 alternate that the table above uses.

   ``D5`` and ``D8`` both expose TIM channels that overlap with
   ``D4``/``D7`` on TIM3/TIM8 and with ``D8``/``D9`` on TIM4 —
   pick one consumer per timer channel.

Software bit‑banged buses
~~~~~~~~~~~~~~~~~~~~~~~~~

:ref:`machine.SoftI2C <machine.SoftI2C>` and :ref:`machine.SoftSPI
<machine.SoftSPI>` work on any GPIO if you need an extra bus.

Timing
------

time
~~~~

The :mod:`time` module covers blocking delays, monotonic ticks, and
elapsed‑time measurement::

    import time

    time.sleep(1)              # seconds
    time.sleep_ms(500)
    time.sleep_us(10)

    start = time.ticks_ms()
    # ...do work...
    elapsed = time.ticks_diff(time.ticks_ms(), start)

Virtual timers
~~~~~~~~~~~~~~

:ref:`machine.Timer <machine.Timer>` schedules periodic or one‑shot
callbacks without consuming a hardware timer slot. Pass ``-1`` as
the id to use a virtual (software) timer::

    from machine import Timer

    one_shot = Timer(-1)
    one_shot.init(period=5_000, mode=Timer.ONE_SHOT,
                  callback=lambda t: print("once"))

    periodic = Timer(-1)
    periodic.init(period=2_000, mode=Timer.PERIODIC,
                  callback=lambda t: print("tick"))

Period values are in milliseconds. Call :meth:`~machine.Timer.deinit`
to stop and release the slot.

Real‑time clock
~~~~~~~~~~~~~~~

:ref:`machine.RTC <machine.RTC>` keeps wall‑clock time across
resets — and across full power‑off when a coin cell is connected to
the ``VRTC`` pin::

    from machine import RTC

    rtc = RTC()
    rtc.datetime((2026, 4, 30, 4, 12, 0, 0, 0))   # Y, M, D, weekday, h, m, s, subsec
    print(rtc.datetime())

Watchdog
~~~~~~~~

:ref:`machine.WDT <machine.WDT>` resets the board if the application
hangs. Once started it can't be stopped or reconfigured — feed it
periodically inside your main loop::

    from machine import WDT

    wdt = WDT(timeout=5_000)   # 5 second window
    while True:
        # ...do work...
        wdt.feed()

Boot and runtime info
---------------------

Firmware update (DFU)
~~~~~~~~~~~~~~~~~~~~~

The Giga R1 uses Arduino's standard **double‑tap reset** to enter
the STM32H747 ROM bootloader. Quickly press the reset button twice
— the board re‑enumerates over USB as a DFU device and OpenMV IDE
can flash a new firmware image. If the bootloader is missing
entirely, hold the **BOOT0 button** while pressing reset to force
the SoC into ROM bootloader mode.

Filesystem and boot order
~~~~~~~~~~~~~~~~~~~~~~~~~

The Giga R1 firmware mounts up to two filesystems on boot:

* **Internal flash** — always mounted at ``/flash``. Holds
  ``main.py`` and ``README.txt`` by default; created on the very
  first boot.
* **ROMFS** — read‑only, memory‑mapped filesystem at ``/rom`` used
  to ship large data assets (e.g. AI models) that benefit from
  zero‑copy access. Mounted automatically by MicroPython at
  startup, before any user Python runs. The Giga R1 build ships
  with micro_speech, person_detect, FOMO face detection, YOLO‑LC,
  BlazeFace, and the standard OpenCV Haar cascades preloaded.

After mounting, the working directory is set to ``/flash``. The
interpreter then runs scripts from that directory:

* ``boot.py`` is executed on **every** soft reset (cold boot,
  ``Ctrl‑D`` from the REPL, or whenever the running script returns).
* ``main.py`` is executed **only on cold boot**, immediately after
  ``boot.py``. Subsequent soft resets re‑run ``boot.py`` but drop
  straight to the REPL — to re‑run ``main.py`` you have to fully
  reset the board.

The default ``main.py`` shipped on a freshly flashed board just
blinks the user RGB LED's **blue** channel as a heartbeat (two short
pulses, short gap), so you can tell the firmware booted cleanly
without any host attached.

``sys.path`` is extended to include both filesystems and their
``lib/`` subdirectories, so importable modules can live in
``/flash/lib`` or ``/rom/lib``.

When connected over USB, ``/flash`` also enumerates as a USB
mass‑storage drive on the host, letting you edit ``boot.py``,
``main.py``, and any other files directly. **Eject the drive before
resetting the board** so the host flushes its cached writes.

Hard‑fault indicator
~~~~~~~~~~~~~~~~~~~~

If the user RGB LED is rapidly cycling through all colours — fast
enough that it tends to look like a **twinkling white LED** rather
than distinct hues — the firmware has hit an unrecoverable hard
fault. Reflash the firmware to recover; if reflashing doesn't help,
the board may be physically damaged.

Software libraries
------------------

See the :doc:`library index </library/index>` for the full list of
modules — including which ones are unique to the Giga R1 build.
