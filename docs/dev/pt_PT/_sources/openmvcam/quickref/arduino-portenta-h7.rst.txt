Arduino Portenta H7
===================

The Arduino Portenta H7 is a 66 × 25 mm industrial dev board built
around the STMicroelectronics STM32H747XI — a dual‑core SoC combining
a Cortex‑M7 at 400 MHz with a Cortex‑M4 at 200 MHz. The OpenMV
firmware runs entirely on the M7 core and is designed to be used with
the **Portenta Vision Shield** (Ethernet or LoRa edition), which adds
a Himax HM01B0 / HM0360 camera, dual PDM microphones, and a microSD
slot to the base Portenta H7.

.. image:: ../arduino-portenta-h7-hero.jpg
    :alt: Arduino Portenta H7
    :width: 400px
    :align: center

For full datasheet, photos, and dimensions see the
`Arduino Portenta H7 product page <https://store.arduino.cc/products/portenta-h7>`_.

Highlights
----------

* **STMicroelectronics STM32H747XI** dual Cortex‑M7 (400 MHz) +
  Cortex‑M4 (200 MHz). OpenMV firmware runs on the M7 core only;
  the M4 core is exposed through :doc:`openamp </library/openamp>`
  for Inter‑Processor Communication.
* **8 MB external SDRAM** plus **2 MB internal flash** and **16 MB
  external QSPI flash**.
* Hardware **JPEG encoder/decoder**.
* **Wi‑Fi b/g/n** (2.4 GHz) + **Bluetooth LE 5.1** via the Murata
  1DX (CYW4343W) module — connects to the supplied antenna via an
  on‑board **U.FL connector**.
* **High‑speed USB‑C** (480 Mb/s).
* **22 user I/O pins** on the Arduino MKR‑style top headers — D0–D14
  (digital) plus A0–A6 (analog).
* **Two 80‑pin high‑density connectors** on the bottom expose the
  full STM32H747 fabric — DCMI, DSI, Ethernet RMII, FDCAN, SDIO,
  SAI/I²S, UARTs, additional SPI/I²C/timers, and so on. Shields
  like the Vision Shield mate to these connectors.
* **JTAG / SWD** broken out on the bottom HD connectors for advanced
  debug.
* **Battery support** — 3.7 V Li‑Po JST connector plus on‑board
  charger and battery monitor.

Pinout
------

.. image:: ../pinout-arduino-portenta-h7.png
    :alt: Arduino Portenta H7 Pinout
    :width: 700px

Pin reference
-------------

22 user pins are exposed on the Arduino MKR‑style top edge
headers — 15 digital (``D0``-``D14``) plus 7 analog
(``A0``-``A6``). Many more SoC pins are available through the
bottom **80‑pin high‑density connectors** for shield work; see
Arduino's
`full pinout PDF <https://docs.arduino.cc/resources/pinouts/ABX00042-full-pinout.pdf>`_
for that mapping.

.. csv-table::
   :header: "Pin name", "Reference", "Function"
   :widths: 14, 12, 74

   "D0",         "3.3 V", "TIM8 CH3N"
   "D1",         "3.3 V", "TIM1 CH1 / SPI5 NSS"
   "D2",         "3.3 V", "TIM1 CH2 / SPI5 MISO"
   "D3",         "3.3 V", "GPIO"
   "D4",         "3.3 V", "TIM3 CH2 / TIM8 CH2 / USART6 RX"
   "D5",         "3.3 V", "TIM3 CH1 / TIM8 CH1 / USART6 TX"
   "D6",         "3.3 V", "TIM1 CH1 / I2C3 SCL"
   "D7",         "3.3 V", "TIM5 CH4 / SPI2 NSS"
   "D8",         "3.3 V", "SPI2 MOSI (shared with A3 / A5)"
   "D9",         "3.3 V", "SPI2 SCK"
   "D10",        "3.3 V", "SPI2 MISO (shared with A2 / A4)"
   "D11",        "3.3 V", "I2C3 SDA"
   "D12",        "3.3 V", "I2C3 SCL"
   "D13",        "3.3 V", "USART1 RX / TIM1 CH3"
   "D14",        "3.3 V", "USART1 TX / TIM1 CH2"
   "A0",         "3.3 V", "ADC12 IN0 (analog only)"
   "A1",         "3.3 V", "ADC12 IN1 (analog only)"
   "A2",         "3.3 V", "ADC123 IN12 (analog only; shared with D10)"
   "A3",         "3.3 V", "ADC12 IN13 (analog only; shared with D8)"
   "A4",         "3.3 V", "ADC123 IN12 (shared with D10)"
   "A5",         "3.3 V", "ADC12 IN13 (shared with D8)"
   "A6",         "3.3 V", "DAC1 OUT1 / ADC12 IN18"
   "A7",         "3.3 V", "TIM3 CH1 / ADC12 IN3 (not exposed on the headers)"
   "D20",        "3.3 V", "alias of ``D8`` / ``A3`` / ``A5``"
   "D21",        "3.3 V", "alias of ``A6`` — DAC1 OUT1"
   "RESET",      "3.3 V", "press the on‑board switch or pull to GND to reset"
   "LED_RED",    "3.3 V", "RGB LED red channel (active low)"
   "LED_GREEN",  "3.3 V", "RGB LED green channel (active low)"
   "LED_BLUE",   "3.3 V", "RGB LED blue channel (active low)"

.. note::

   ``A0``-``A3`` are **analog-only** pads on the STM32H747 with
   no GPIO function — treat them as ADC inputs only.
   ``A2``/``A4`` and ``A3``/``A5`` share their physical pins
   with ``D10`` and ``D8`` respectively, so you can't drive PWM
   or SPI on those while reading them as analog. ``A7`` lives
   on the bottom HD connectors.

Power pins
----------

MKR header pins:

* **VIN** — main system rail into the on‑board PMIC. Fed via a
  diode from the ``+5V`` rail, the MKR ``VIN`` pin, or the bottom
  80‑pin HD connectors.
* **+5V** — 5 V rail fed from USB, the ESLOV connector, or the MKR
  ``+5V`` pin itself.
* **+3V3** — main 3.3 V rail (PMIC switching regulator output).
* **AREF** — analog voltage reference for the ADC pins. Defaults
  to 3.3 V; drive externally to use a different reference.
* **GND** — common ground.

Battery input:

* **Li‑Po JST** on the front of the board accepts a 3.7 V Li‑Po
  cell. The PMIC charges it whenever ``+5V`` or ``VIN`` is
  present.

The Portenta H7 can be powered through any of these paths:

* **USB‑C** — supplies 5 V to the on‑board PMIC.
* **ESLOV connector** — up to 5 V on ``VESLOV`` (see
  :ref:`arduino-portenta-h7-eslov`).
* **VIN pin** — drive a regulated 5 V supply directly.
* **Li‑Po battery** — connect to the JST on the front.

.. _arduino-portenta-h7-eslov:

ESLOV connector
~~~~~~~~~~~~~~~

On the side of the board is a 5‑pin solder‑free **ESLOV**
connector:

.. csv-table::
   :header: "Pin", "Name", "Function"
   :widths: 8, 14, 78

   "1", "VESLOV",  "5 V power output (same rail as the MKR header's ``+5V``)"
   "2", "INT",     "external interrupt input on ``D7``"
   "3", "SCL_EXT", "shared with the MKR header ``D12`` pad — same I²C 3 bus as the user header"
   "4", "SDA_EXT", "shared with the MKR header ``D11`` pad — same I²C 3 bus as the user header"
   "5", "GND",     "common ground"

ESLOV's ``SCL_EXT``/``SDA_EXT`` and the MKR header's ``D12``/``D11``
are the same pins — one I²C 3 bus exposed on two connectors.

.. tip::

   Use the :doc:`battery life estimator <../tutorial/tools/battery-life-estimator>` to
   model how long the Portenta H7 will run on a battery for a given
   active / deep-sleep duty cycle.

Recovery and debug pins
-----------------------

* **RESET** — both an exposed pin on the top header and a momentary
  switch on the side of the board, tied to the SoC's NRST line. Pull
  to GND or press the button to reset.

The Portenta H7 uses Arduino's standard **double‑tap reset** to enter
Arduino's bootloader. Quickly press the reset button twice — the
board re‑enumerates over USB as a DFU device and OpenMV IDE can
flash a new firmware image.

The STM32 SWD signals are exposed on the bottom **HD connector
J1**:

* ``J1‑73`` — NRST
* ``J1‑75`` — SWDIO (PA13)
* ``J1‑77`` — SWCLK (PA14)
* ``J1‑79`` — SWO (PB3)

Wire them up via a Portenta Breakout, the official Arduino debug
adapter, or a custom carrier with a 1.27 mm header. All debug
signals are **3.3 V referenced**.

.. note::

   When the **Portenta Vision Shield** is attached, the same SWD/JTAG
   signals are routed up to the standard **20‑pin ARM Cortex Debug
   JTAG header** on the shield (1.27 mm / 0.05″ pitch).

Onboard peripherals
-------------------

LEDs
~~~~

The Portenta H7 has a single user RGB LED, software‑controllable
through :ref:`machine.LED <machine.LED>`::

    from machine import LED

    LED("LED_RED").on()
    LED("LED_GREEN").on()
    LED("LED_BLUE").on()

A separate orange **charge** LED next to the battery JST lights when
the on‑board charger is sourcing current into a connected Li‑Po; it
is not user‑controllable.

Camera sensor (Vision Shield)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With the **Portenta Vision Shield** (Ethernet or LoRa edition)
attached, the Himax sensor is driven through the
:doc:`/library/omv.csi` module::

    import csi

    cam = csi.CSI()
    cam.reset()
    cam.pixformat(csi.GRAYSCALE)
    cam.framesize(csi.QVGA)
    cam.snapshot(time=2000)       # let auto‑exposure settle

    while True:
        img = cam.snapshot()

Two Vision Shield revisions are supported:

* **HM01B0** — 320 × 320 monochrome.
* **HM0360** — 640 × 480 monochrome.

.. warning::

   While the Vision Shield camera is initialised, the following MKR
   header pins are claimed by the firmware and **cannot be used**:

   .. csv-table::
      :header: "MKR pin", "Reason"
      :widths: 18, 82

      "``D1``",        "TIM1 CH1 — camera master clock"
      "``D6``",        "TIM1 CH1 (alt) — camera master clock"
      "``D11``",       "I²C 3 SDA — shared with the camera; bus is usable but avoid the sensor's I²C address (``0x24``)"
      "``D12``",       "I²C 3 SCL — shared with the camera; bus is usable but avoid the sensor's I²C address (``0x24``)"
      "``A6`` / ``D21``", "DCMI HSYNC — also disables the DAC"
      "``A7``",        "DCMI PXCLK"

Machine learning
~~~~~~~~~~~~~~~~

:doc:`/library/omv.ml` runs quantised TFLite models on the Cortex‑M7
with **CMSIS‑NN** kernels — fast enough for compact detectors at a
few frames per second. Models on the read‑only ``/rom`` filesystem
load directly from flash without copying to RAM. Here's a 128×128
BlazeFace detector overlaying the detected face and its six landmarks
on every frame from the Vision Shield camera::

    import csi
    import time
    import ml
    from ml.postprocessing.mediapipe import BlazeFace

    # Initialize the sensor.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.GRAYSCALE)
    csi0.framesize(csi.QVGA)
    csi0.window((240, 240))

    # Load built-in face detection model
    model = ml.Model("/rom/blazeface_front_128.tflite", postprocess=BlazeFace(threshold=0.4))
    print(model)

    clock = time.clock()
    while True:
        clock.tick()
        img = csi0.snapshot()

        # faces is a list of ((x, y, w, h), score, keypoints) tuples
        for r, score, keypoints in model.predict([img]):
            ml.utils.draw_predictions(img, [r], ("face",), ((0, 0, 255),), format=None)

            # keypoints is a ndarray of shape (6, 2)
            ml.utils.draw_keypoints(img, keypoints, color=(255, 0, 0))

        print(clock.fps(), "fps")

M4 core
~~~~~~~

The Cortex‑M4 core is exposed through :doc:`openamp </library/openamp>`
for inter‑processor communication. The OpenMV firmware runs on the
M7 only; the M4 has no MicroPython runtime of its own, so using it
means building a separate C firmware image and loading it from the
filesystem via :class:`openamp.RemoteProc`.
Pre‑built example firmware that implements a virtual UART endpoint
is available in the
`openamp_vuart <https://github.com/iabdalkader/openamp_vuart>`_
repository — follow its README to build ``vuart.elf``::

    import openamp
    import time

    def ept_recv_callback(src_addr, data):
        print("Received:", data.decode())

    ept = openamp.Endpoint("vuart-channel", callback=ept_recv_callback)

    rproc = openamp.RemoteProc("vuart.elf")
    rproc.start()

    count = 0
    while True:
        if ept.is_ready():
            ept.send("Hello World %d!" % count, timeout=1000)
            count += 1
        time.sleep_ms(1000)

In practice this support is best treated as a demonstration of the
openamp interface rather than a working dual‑core platform — the
M4 cannot be reset independently of the M7, so stopping the M4
forces a full system reboot.

Microphone (Vision Shield)
~~~~~~~~~~~~~~~~~~~~~~~~~~

The Vision Shield carries **dual PDM microphones** captured
through :doc:`/library/omv.audio` over the STM32's SAI4
peripheral. Each buffer arrives as signed‑16‑bit PCM ``bytearray``,
ready to feed into :doc:`ulab/numpy </library/omv.ulab.numpy>` for
DSP — for example, a simple loudness detector::

    import audio
    from ulab import numpy as np

    def loudness(pcmbuf):
        samples = np.array(np.frombuffer(pcmbuf, dtype=np.int16), dtype=np.float)
        rms = np.sqrt(np.mean(samples ** 2))
        if rms > 10000:
            print("Loud!", int(rms))

    audio.init(channels=1, frequency=16000, gain_db=24)
    audio.start_streaming(loudness)

    while True:
        pass

Pass ``channels=2`` to ``audio.init`` to receive interleaved
samples from both mics.

Battery fuel gauge
~~~~~~~~~~~~~~~~~~

The Maxim **MAX17262** ModelGauge m5 fuel gauge tracks the Li‑Po
battery's voltage, current, temperature, and state of charge. It
sits on **I²C 1** at address ``0x36``.

The MAX17262 has **internal** current sensing, so the current
register reads out directly in microamps with no external Rsense
factor to apply. Reading the fuel gauge is harmless — there is no
driver shipped, but the registers documented in the
`MAX17262 datasheet <https://www.analog.com/media/en/technical-documentation/data-sheets/MAX17262.pdf>`_
can be read directly::

    import time
    import struct
    from machine import I2C

    FUEL_GAUGE = 0x36   # MAX17262

    def read_reg(bus, addr, reg):
        return struct.unpack("<H", bus.readfrom_mem(addr, reg, 2))[0]

    def read_signed(bus, addr, reg):
        v = read_reg(bus, addr, reg)
        return v - 0x10000 if v & 0x8000 else v

    bus = I2C(1)

    while True:
        # 0x05 RepCap — remaining capacity, raw × 0.5 mAh
        rep_cap   = read_reg(bus, FUEL_GAUGE, 0x05) * 0.5
        # 0x06 RepSOC — state of charge, raw / 256 %
        soc       = read_reg(bus, FUEL_GAUGE, 0x06) / 256
        # 0x08 Temp — die temperature, signed, raw / 256 °C
        temp      = read_signed(bus, FUEL_GAUGE, 0x08) / 256
        # 0x09 VCell — battery voltage, raw × 78.125 µV
        vcell     = read_reg(bus, FUEL_GAUGE, 0x09) * 78.125 / 1_000_000
        # 0x0A Current — signed, raw × 156.25 µA
        current   = read_signed(bus, FUEL_GAUGE, 0x0A) * 156.25 / 1000
        # 0x0B AvgCurrent — averaged current
        avg_curr  = read_signed(bus, FUEL_GAUGE, 0x0B) * 156.25 / 1000
        # 0x10 FullCapRep — learned full capacity, raw × 0.5 mAh
        full_cap  = read_reg(bus, FUEL_GAUGE, 0x10) * 0.5
        # 0x11 TTE — time-to-empty (valid while discharging), raw × 5.625 s
        tte_s     = read_reg(bus, FUEL_GAUGE, 0x11) * 5.625
        # 0x20 TTF — time-to-full   (valid while charging),  raw × 5.625 s
        ttf_s     = read_reg(bus, FUEL_GAUGE, 0x20) * 5.625
        # 0x17 Cycles — charge-cycle counter, 1% per LSB
        cycles    = read_reg(bus, FUEL_GAUGE, 0x17) / 100

        print("V:        %.3f V" % vcell)
        print("Capacity: %.1f / %.1f mAh (%.1f %%)" % (rep_cap, full_cap, soc))
        print("Temp:     %.1f C" % temp)
        print("Current:  %.1f mA  (avg %.1f mA)" % (current, avg_curr))
        print("TTE:      %.0f s   TTF: %.0f s" % (tte_s, ttf_s))
        print("Cycles:   %.2f" % cycles)
        print()
        time.sleep_ms(1000)

``Current`` is signed two's-complement: positive while charging,
negative while discharging. ``TTE`` is only meaningful when current
is negative; ``TTF`` only when current is positive.

Power management IC
~~~~~~~~~~~~~~~~~~~

The NXP **PF1550** PMIC handles every regulator on the Portenta H7
— the +3V3 main rail, the +1V8 SoC core / I/O rail, and the Li‑Po
charger. It sits on **I²C 1** at address ``0x08``.

.. warning::

   **Reading PMIC registers is fine; writing to them is dangerous.**
   Misconfiguring a buck regulator or charger setting can
   permanently damage the board, the battery, or both. Treat the
   PMIC as read‑only unless you know exactly what you're doing.

The most useful thing the PMIC tells you that the fuel gauge can't
is the **charger state machine** — whether the board is currently
running on USB / ESLOV / VIN, what stage of the charge cycle the Li‑Po is
in, and whether the charger is in a thermal or watchdog fault. The
charger registers live at an offset of ``0x80`` in the PF1550's
main I²C address space (see §22.2 of the
`PF1550 datasheet <https://www.nxp.com/docs/en/data-sheet/PF1550.pdf>`_),
so for example ``CHG_INT_OK`` at charger address ``0x04`` is read
from PMIC register ``0x84``::

    import time
    from machine import I2C

    PMIC = 0x08

    # Charger state machine (low nibble of CHG_SNS, register 0x87)
    CHG_STATES = {
        0x0: "precharge",
        0x1: "fast charge (constant current)",
        0x2: "fast charge (constant voltage)",
        0x3: "end of charge",
        0x4: "done",
        0x6: "timer fault",
        0x7: "thermistor suspend",
        0x8: "off — input invalid or charger disabled",
        0x9: "battery overvoltage",
        0xA: "thermal shutdown",
        0xC: "linear mode (not charging)",
    }

    bus = I2C(1)

    while True:
        # 0x84 CHG_INT_OK — single-bit indicators
        ok = bus.readfrom_mem(PMIC, 0x84, 1)[0]
        vbus_ok = bool(ok & (1 << 5))   # bit 5 — VBUS valid (USB/VIN)
        bat_ok  = bool(ok & (1 << 2))   # bit 2 — battery OK
        chg_ok  = bool(ok & (1 << 3))   # bit 3 — charger actively charging
        thm_ok  = bool(ok & (1 << 7))   # bit 7 — thermistor in normal range

        # 0x87 CHG_SNS — charger state + thermal regulation flag
        chg_sns = bus.readfrom_mem(PMIC, 0x87, 1)[0]
        state   = CHG_STATES.get(chg_sns & 0x0F, "reserved")
        treg    = bool(chg_sns & (1 << 7))   # thermal regulation active

        print("VBUS valid:         ", vbus_ok)
        print("battery OK:         ", bat_ok)
        print("charger active:     ", chg_ok)
        print("thermistor normal:  ", thm_ok)
        print("thermal reg active: ", treg)
        print("state:              ", state)
        print()
        time.sleep_ms(1000)

Other read‑only registers worth a look in the datasheet (all at
charger‑offset ``0x80``): ``0x80`` ``CHG_INT`` (latched charger
interrupts — fault flags), ``0x86`` ``VBUS_SNS`` (the multi‑bit
VBUS state including OVLO / UVLO / DPM), and ``0x88`` ``BATT_SNS``
(battery presence and overcurrent state).

Wi‑Fi
~~~~~

The on‑board Murata 1DX (CYW4343W) is exposed via
:doc:`/library/network` as a station interface. Connect the supplied
antenna to the on‑board **U.FL connector** before bringing up the
radio::

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
            conn = await aioble.advertise(250_000, name="Portenta-H7")
            print("Connected:", conn.device)
            await conn.disconnected()

    asyncio.run(run())

LoRa (Vision Shield)
~~~~~~~~~~~~~~~~~~~~

The **LoRa edition** of the Vision Shield adds a Murata CMWX1ZZABZ
LoRaWAN module wired to the Portenta H7 over UART. The ``lora``
module wraps the AT‑command firmware and supports OTAA or ABP join,
uplink, and downlink::

    from lora import Lora
    from lora import BAND_EU868
    from lora import LoraErrorTimeout

    lora = Lora(band=BAND_EU868, poll_ms=60000)
    print("Device EUI:", lora.get_device_eui())

    appEui = "1234567890123456"
    appKey = "12345678901234567890123456789012"

    try:
        lora.join_OTAA(appEui, appKey)
    except LoraErrorTimeout as e:
        print("Join timed out — try moving near a window:", e)

    lora.set_port(3)
    lora.send_data("HeLoRA world!", True)

    while True:
        if lora.available():
            data = lora.receive_data()
            if data:
                print("Port:", data["port"], "Data:", data["data"])
        lora.poll()

Use ``BAND_US915`` / ``BAND_AS923`` / ``BAND_AU915`` etc. for
non‑EU regions, and switch to :meth:`lora.Lora.join_ABP` if your
network server uses ABP activation.

.. warning::

   While the LoRa module is in use, the driver claims the following
   MKR header pins as control lines for the Murata CMWX1ZZABZ —
   they **cannot be used**:

   .. csv-table::
      :header: "MKR pin", "Reason"
      :widths: 18, 82

      "``D3``", "LoRa module **BOOT** pin"
      "``D5``", "LoRa module **RST** pin"

Ethernet (Vision Shield)
~~~~~~~~~~~~~~~~~~~~~~~~

The **Ethernet edition** of the Vision Shield adds an RJ45 jack with
magnetics wired to the STM32H747's 10/100 Ethernet MAC over RMII.
Plug in an Ethernet cable and the PHY appears as a ``LAN`` interface;
DHCP runs automatically once the link comes up::

    import network
    import time

    lan = network.LAN()
    lan.active(True)
    while not lan.isconnected():
        time.sleep(1)
    print("Ethernet IP:", lan.ipconfig("addr4")[0])

microSD card (Vision Shield)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When a card is inserted it is mounted automatically at ``/sdcard`` and
is usable through the regular file system::

    import os

    for entry in os.listdir("/sdcard"):
        print(entry)

Bus reference
-------------

GPIO
~~~~

Use :ref:`machine.Pin <machine.Pin>` to read or drive any of the
silkscreened pins. Outputs are 3.3 V CMOS and can sink/source up to
20 mA per pin (140 mA total across the whole header).

::

    from machine import Pin

    out = Pin("D0", Pin.OUT)
    out.on()
    out.off()
    out.value(1)

    inp = Pin("D1", Pin.IN, Pin.PULL_UP)
    print(inp.value())

Any input pin can also fire an interrupt on edge transitions::

    def handler(pin):
        print("triggered:", pin)

    Pin("D1", Pin.IN, Pin.PULL_UP).irq(
        handler, Pin.IRQ_FALLING | Pin.IRQ_RISING,
    )

UART
~~~~

============  ====  ====
Bus           TX    RX
============  ====  ====
UART1         D14   D13
UART6         D5    D4
============  ====  ====

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
I2C3          D12   D11
============  ====  ====

::

    from machine import I2C

    i2c = I2C(3, freq=400_000)
    i2c.scan()
    i2c.writeto(0x76, b"hi")

The ``D11``/``D12`` pads on the MKR header and the ESLOV connector's
``SDA_EXT``/``SCL_EXT`` pins land on the same I²C 3 bus — see
:ref:`arduino-portenta-h7-eslov` above for the ESLOV pinout.

The same hardware can also be used in target (slave) mode through
:ref:`machine.I2CTarget <machine.I2CTarget>` to expose a memory
region to another I²C controller::

    from machine import I2CTarget

    buf = bytearray(32)
    target = I2CTarget(3, addr=0x42, mem=buf)

SPI
~~~

============  =====  =====  =====  ====
Bus           MOSI   MISO   SCK    CS
============  =====  =====  =====  ====
SPI2          D8     D10    D9     D7
============  =====  =====  =====  ====

::

    from machine import SPI
    from machine import Pin

    spi = SPI(2, baudrate=10_000_000)
    cs = Pin("D7", Pin.OUT, value=1)   # CS is not driven by the SPI peripheral

    cs.value(0)
    spi.write(b"hello")
    cs.value(1)

ADC
~~~

The Portenta H7 exposes eight 12‑bit ADC channels on **A0–A7**. All
are **3.3 V referenced** — ``read_u16`` returns 0–65535 across
0–3.3 V at the pin::

    from machine import ADC
    import time

    adc = ADC("A0")
    while True:
        voltage = adc.read_u16() * 3.3 / 65535
        print(voltage)
        time.sleep_ms(100)

DAC
~~~

A single 12‑bit DAC channel is exposed on **DAC1** (``A6`` /
``D21``) through :class:`pyb.DAC`::

    from pyb import DAC

    dac = DAC("DAC1")
    dac.write(int(0.5 * 255))   # 8‑bit output, ~1.65 V

PWM
~~~

============  ============================
Pin           Timer / channel
============  ============================
D0            TIM8 CH3N
D1            TIM1 CH1, TIM8 CH3N
D2            TIM1 CH2, TIM8 CH2N
D4            TIM3 CH2, TIM8 CH2
D5            TIM3 CH1, TIM8 CH1
D6            TIM1 CH1
D7            TIM5 CH4
D13           TIM1 CH3
D14           TIM1 CH2
A7            TIM3 CH1
============  ============================

Drive any of them via :ref:`machine.PWM <machine.PWM>`::

    from machine import Pin, PWM

    pwm = PWM(Pin("D4"), freq=1_000, duty_u16=32768)

.. note::

   Several pins share timer channels:

   * **TIM1 CH1** is on ``D1`` *and* ``D6``.
   * **TIM1 CH2** is on ``D2`` *and* ``D14``.
   * **TIM8 CH3N** is on ``D0`` *and* ``D1``.

   Pick one consumer per timer channel.

.. warning::

   **TIM1** is reserved for the **camera master clock** when the
   Vision Shield is initialised through :doc:`/library/omv.csi` —
   ``D1``, ``D2``, ``D6``, ``D13``, and ``D14`` cannot be PWM‑driven
   while the camera is active.

Software bit‑banged buses
~~~~~~~~~~~~~~~~~~~~~~~~~

:ref:`machine.SoftI2C <machine.SoftI2C>` and :ref:`machine.SoftSPI
<machine.SoftSPI>` work on any GPIO if you need an extra bus.

Thermal sensor (off‑board)
~~~~~~~~~~~~~~~~~~~~~~~~~~

The firmware includes the :doc:`/library/omv.fir` driver for
externally wired thermal imagers:

* **MLX90621** — 16 × 4 IR array
* **MLX90640** — 32 × 24 IR array
* **MLX90641** — 16 × 12 IR array
* **AMG8833** — 8 × 8 IR array

Wire the module to the board's I²C bus and read frames with
``fir.init()`` + ``fir.snapshot()``::

    import time
    import image
    import fir

    fir.init()                          # auto‑detects the sensor
    clock = time.clock()

    while True:
        clock.tick()
        try:
            img = fir.snapshot(x_scale=5, y_scale=5,
                               color_palette=image.PALETTE_IRONBOW,
                               hint=image.BICUBIC,
                               copy_to_fb=True)
        except OSError:
            continue
        print(clock.fps())

The ``fir`` driver only talks to the sensor over **I²C 3** — wire
the module to ``D12`` (SCL) and ``D11`` (SDA).

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
resets. The HD connector also exposes a ``COINCELL`` pad that can
back the RTC from a CR2032 across power loss::

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

The Portenta H7 uses Arduino's standard **double‑tap reset** to
enter Arduino's bootloader. Quickly press the reset button twice —
the board re‑enumerates over USB as a DFU device and OpenMV IDE
can flash a new firmware image.

A running script can re‑enter the bootloader on demand by calling
:func:`machine.bootloader`::

    import machine

    machine.bootloader()

.. _arduino-portenta-h7-fs:

Filesystem and boot order
~~~~~~~~~~~~~~~~~~~~~~~~~

The Portenta H7 firmware mounts up to three filesystems on boot:

* **Internal flash** — always mounted at ``/flash``. Holds
  ``main.py`` and ``README.txt`` by default; created on the very
  first boot.
* **microSD card** — if a Vision Shield is attached and a card is
  inserted, it is mounted at ``/sdcard``.
* **ROMFS** — read‑only, memory‑mapped filesystem at ``/rom``
  mounted automatically by MicroPython at startup.

After mounting, the working directory is set to ``/sdcard`` when the
card is present, otherwise ``/flash``. The interpreter then runs
scripts from that directory:

* ``boot.py`` is executed on **every** soft reset (cold boot,
  ``Ctrl‑D`` from the REPL, or whenever the running script returns).
* ``main.py`` is executed **only on cold boot**, immediately after
  ``boot.py``. Subsequent soft resets re‑run ``boot.py`` but drop
  straight to the REPL — to re‑run ``main.py`` you have to fully
  reset the board.

Dropping a ``boot.py`` or ``main.py`` onto the SD card overrides the
copy in flash without touching it — both files are looked up in the
boot directory (``/sdcard`` when the card is mounted, otherwise
``/flash``).

The default ``main.py`` shipped on a freshly flashed board just
blinks the user RGB LED's **blue** channel as a heartbeat (two short
pulses, short gap), so you can tell the firmware booted cleanly
without any host attached.

``sys.path`` is extended to include all three filesystems and their
``lib/`` subdirectories, so importable modules can live in
``/flash/lib``, ``/sdcard/lib``, or ``/rom/lib``.

To force the system to ignore an inserted SD card (for example to run
the flash ``main.py`` even with a card present), create an empty file
named ``SKIPSD`` at the root of ``/flash``.

When connected over USB, the boot filesystem (``/sdcard`` if a card
is present, otherwise ``/flash``) also enumerates as a USB
mass‑storage drive on the host, letting you edit ``boot.py``,
``main.py``, and any other files directly. **Eject the drive before
resetting the board** so the host flushes its cached writes.

.. note::

   Because the OS treats the drive as a passive block device, files
   created or modified by code running on the camera will not show
   up until the host re‑mounts the drive. If both the OS and the
   camera write the same filesystem at the same time, the OS will
   win and overwrite changes made by the camera. Use the SD card for
   any data the script writes back, and remount before reading those
   files from the host.

.. note::

   The user RGB LED's **red** channel may briefly light up while the
   host is reading from or writing to the USB mass‑storage drive —
   this is a firmware‑driven activity indicator, not a fault.

Storage sizes
~~~~~~~~~~~~~

The Portenta H7 ships with:

* ``/flash`` — **11 MB** FAT filesystem, read/write.
* ``/rom`` — **4 MB** read-only memory-mapped ROMFS, used to
  ship scripts and ML models that benefit from zero-copy mmap
  access.
* ``/sdcard`` — full size of whatever microSD card is inserted
  in a Vision Shield (when present), read/write.

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
modules — including which ones are unique to the Portenta H7 build.
