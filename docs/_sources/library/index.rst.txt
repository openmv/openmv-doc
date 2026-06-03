.. _micropython_lib:

OpenMV MicroPython libraries
============================

.. warning::

   Important summary of this section

   * MicroPython provides built-in modules that mirror the functionality of the
     :ref:`Python standard library <micropython_lib_python>` (e.g. :mod:`os`,
     :mod:`time`), as well as :ref:`MicroPython-specific modules <micropython_lib_micropython>`
     (e.g. :mod:`bluetooth`, :mod:`machine`).
   * Most Python standard library modules implement a subset of the
     functionality of the equivalent Python module, and in a few cases provide
     some MicroPython-specific extensions (e.g. :mod:`array`, :mod:`os`)
   * Due to resource constraints or other limitations, some ports or firmware
     versions may not include all the functionality documented here.
   * To allow for extensibility, some built-in modules can be
     :ref:`extended from Python code <micropython_lib_extending>` loaded onto
     the device filesystem.

This chapter describes modules (function and class libraries) which are built
into MicroPython. This documentation in general aspires to describe all modules
and functions/classes which are implemented in the MicroPython project.
However, MicroPython is highly configurable, and each port to a particular
board/embedded system may include only a subset of the available MicroPython
libraries.

With that in mind, please be warned that some functions/classes in a module (or
even the entire module) described in this documentation **may be unavailable**
in a particular build of MicroPython on a particular system. The best place to
find general information of the availability/non-availability of a particular
feature is the "General Information" section which contains information
pertaining to a specific :term:`MicroPython port`.

On some ports you are able to discover the available, built-in libraries that
can be imported by entering the following at the :term:`REPL`::

    help('modules')

Beyond the built-in libraries described in this documentation, many more
modules from the Python standard library, as well as further MicroPython
extensions to it, can be found in :term:`micropython-lib`.

.. _micropython_lib_python:

Python standard libraries and micro-libraries
---------------------------------------------

The following standard Python libraries have been "micro-ified" to fit in with
the philosophy of MicroPython.  They provide the core functionality of that
module and are intended to be a drop-in replacement for the standard Python
library.

.. toctree::
   :maxdepth: 1

   array.rst
   asyncio.rst
   binascii.rst
   builtins.rst
   cmath.rst
   collections.rst
   errno.rst
   gc.rst
   gzip.rst
   hashlib.rst
   heapq.rst
   io.rst
   json.rst
   marshal.rst
   math.rst
   os.rst
   platform.rst
   random.rst
   re.rst
   select.rst
   socket.rst
   ssl.rst
   string.templatelib.rst
   struct.rst
   sys.rst
   time.rst
   types.rst
   zlib.rst

.. _micropython_lib_micropython:

OpenMV Cam libraries
--------------------

The following sections describe the libraries available on each
OpenMV-supported board, including both the MicroPython-specific
built-ins and OpenMV's own extensions.

Common modules
~~~~~~~~~~~~~~

Built into the firmware on every OpenMV camera board.

.. toctree::
   :maxdepth: 1

   bluetooth.rst
   cryptolib.rst
   deflate.rst
   framebuf.rst
   machine.rst
   micropython.rst
   network.rst
   openamp.rst
   uctypes.rst
   vfs.rst
   omv.csi.rst
   omv.sensor.rst
   omv.image.rst
   omv.gif.rst
   omv.mjpeg.rst
   omv.audio.rst
   omv.display.rst
   omv.fir.rst
   omv.tof.rst
   omv.imu.rst
   omv.omv.rst
   omv.crc.rst
   omv.ml.rst
   omv.ulab.rst
   logging.rst
   senml.rst

Frozen Python helpers shipped on most OpenMV camera boards (drivers,
networking, and utilities):

.. toctree::
   :maxdepth: 1

   aioble.rst
   omv.protocol.rst
   omv.rpc.rst
   omv.rtsp.rst
   omv.mqtt.rst
   omv.requests.rst
   omv.mutex.rst
   omv.pid.rst
   omv.bno055.rst
   omv.modbus.rst
   omv.vl53l1x.rst

Networking helpers (require a working network interface):

.. toctree::
   :maxdepth: 1

   ntptime.rst
   webrepl.rst

Web framework
~~~~~~~~~~~~~

Webserver framework modules. See the per-board sections below for
which boards include each one.

.. toctree::
   :maxdepth: 1

   jwt.rst
   microdot.rst

Port-specific modules
~~~~~~~~~~~~~~~~~~~~~

Modules tied to a specific MCU family. See the per-board sections below
for which boards include each one.

.. toctree::
   :maxdepth: 1

   pyb.rst
   stm.rst
   mimxrt.rst
   omv.alif.rst
   rp2.rst
   ubluepy.rst

Hardware drivers
~~~~~~~~~~~~~~~~

Drivers for sensors, displays and other peripherals shipped on one or
more OpenMV-supported boards. See the per-board sections below for which
boards include each one.

.. toctree::
   :maxdepth: 1

   dht.rst
   onewire.rst
   ds18x20.rst
   neopixel.rst
   lsm6dsox.rst
   bmi270.rst
   bmm150.rst
   lsm9ds1.rst
   hts221.rst
   lps22h.rst
   hs3003.rst
   espflash.rst
   imu.rst
   omv.ssd1306.rst
   omv.tb6612.rst
   omv.pca9674a.rst
   omv.tfp410.rst
   omv.ft5x06.rst
   omv.gt911.rst
   omv.lora.rst
   omv.apds9960.rst
   omv.romfs.rst

Per-board availability
~~~~~~~~~~~~~~~~~~~~~~

The lists below show which port-specific and driver modules are shipped
on each board. All the modules in *Common*, *Frozen Python helpers*, and
*Networking helpers* (above) are available on every camera board unless
otherwise noted.

.. rubric:: OpenMV N6

STM32N657 (Cortex-M55 @ 800 MHz) with a 1 GHz on-chip NPU rated at
600 GOPS INT8. Pairs the NPU with the PAG7936 1 MP global-shutter
sensor.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver
* :mod:`jwt` --- JSON Web Tokens
* :mod:`microdot` --- minimal HTTP framework

.. rubric:: OpenMV AE3

Alif Ensemble E3 dual-core SoC: Cortex-M55 @ 400 MHz (HP) plus
Cortex-M55 @ 160 MHz (HE), with two on-chip NPUs (400 MHz / 204 GOPS HP
NPU + 160 MHz / 46 GOPS HE NPU).

* :mod:`alif` --- Alif Ensemble SoC functions
* :mod:`romfs` --- ROMFS helper utilities
* :mod:`pca9674a` --- PCA9674A I2C expander driver
* :mod:`jwt` --- JSON Web Tokens
* :mod:`microdot` --- minimal HTTP framework

.. rubric:: OpenMV Cam RT1062

Low-power machine-vision board around the NXP i.MX RT1062
(Cortex-M7 @ 600 MHz). Combines USB-C high-speed networking, Wi-Fi /
Bluetooth and 10/100 Ethernet.

* :mod:`mimxrt` --- functionality specific to NXP i.MX RT
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver
* :mod:`pca9674a` --- PCA9674A I2C expander driver
* :mod:`jwt` --- JSON Web Tokens
* :mod:`microdot` --- minimal HTTP framework

.. rubric:: OpenMV Pure Thermal

Full-system thermal imaging board around the STM32H743
(Cortex-M7 @ 480 MHz) with 64 MB external SDRAM, 32 MB QSPI flash, a
hardware JPEG codec and DVI/HDMI output.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`tfp410` --- DVI/HDMI serializer
* :mod:`ft5x06` --- capacitive touchscreen driver
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver

.. rubric:: OpenMV Cam H7 Plus

STM32H743 (Cortex-M7 @ 480 MHz) with 32 MB external SDRAM, 32 MB QSPI
flash, a hardware JPEG codec and the OV5640 5MP camera module.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver

.. rubric:: OpenMV Cam H7

STM32H743 (Cortex-M7 @ 480 MHz) with 1 MB internal SRAM, 2 MB internal
flash and a hardware JPEG codec.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver

.. rubric:: OpenMV Cam M7

STM32F765 (Cortex-M7 @ 216 MHz) with 512 KB internal SRAM and 2 MB
internal flash. Bundled with the OV7725 sensor.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver

.. rubric:: OpenMV Cam M4

STM32F427 (Cortex-M4 @ 180 MHz) with 256 KB internal SRAM and 1 MB
internal flash. Bundled with the OV7725 sensor.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver

.. rubric:: Arduino Nicla Vision

22.86 × 22.86 mm machine-vision board around the STM32H747AII6
dual-core SoC: Cortex-M7 @ 400 MHz plus Cortex-M4 @ 200 MHz.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`lsm6dsox` --- LSM6DSOX 6-axis IMU
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs

.. rubric:: Arduino Portenta H7

66 × 25 mm industrial dev board around the STM32H747XI dual-core SoC:
Cortex-M7 @ 400 MHz plus Cortex-M4 @ 200 MHz.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`lora` --- LoRa modem driver
* :mod:`ssd1306` --- OLED driver
* :mod:`tb6612` --- TB6612 motor driver

.. rubric:: Arduino Giga R1 WiFi

101 × 53 mm Mega-form-factor board around the STM32H747XI dual-core
SoC: Cortex-M7 @ 480 MHz plus Cortex-M4 @ 240 MHz, with an on-board
800x480 touchscreen.

* :mod:`pyb` --- functions related to the board
* :mod:`stm` --- functionality specific to STM32 MCUs
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
* :mod:`gt911` --- GT911 5-point capacitive touch controller
* :mod:`ft5x06` --- capacitive touchscreen driver

.. rubric:: Arduino Nano RP2040 Connect

RP2040-based Nano-form-factor board with the U-blox NINA-W102
Wi-Fi/Bluetooth module. *No longer actively supported; the last OpenMV
firmware release for this board is retained for archival use.*

* :mod:`rp2` --- RP2040-specific PIO / DMA / flash helpers
* :mod:`espflash` --- ESP32 ROM bootloader firmware flasher
* :mod:`lsm6dsox` --- LSM6DSOX 6-axis IMU
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs

.. rubric:: Arduino Nano 33 BLE Sense

Nordic nRF52840 Nano-form-factor board with the on-board Arduino
sensor suite. *No longer actively supported; the last OpenMV firmware
release for this board is retained for archival use.*

* :mod:`ubluepy` --- Bluetooth LE peripheral and central API on the
  Nordic SoftDevice
* :mod:`bmi270` --- BMI270 6-axis IMU
* :mod:`bmm150` --- BMM150 3-axis magnetometer
* :mod:`lsm9ds1` --- LSM9DS1 9-axis IMU
* :mod:`hts221` --- HTS221 humidity/temperature sensor
* :mod:`lps22h` --- LPS22HB/HH pressure sensor
* :mod:`hs3003` --- HS3003 humidity/temperature sensor
* :mod:`apds9960` --- proximity, gesture, and color sensor driver
* :mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
* :mod:`onewire` --- 1-Wire bus protocol
* :mod:`ds18x20` --- DS18x20 temperature sensor driver
* :mod:`neopixel` --- control of WS2812 / NeoPixel LEDs

.. _micropython_lib_extending:

Extending built-in libraries from Python
----------------------------------------

A subset of the built-in modules are able to be extended by Python code by
providing a module of the same name in the filesystem. This extensibility
applies to the following Python standard library modules which are built-in to
the firmware: :mod:`array`, :mod:`binascii`, :mod:`collections`, :mod:`errno`,
:mod:`gzip`, :mod:`hashlib`, :mod:`heapq`, :mod:`io`, :mod:`json`, :mod:`os`,
:mod:`platform`, :mod:`random`, :mod:`re`, :mod:`select`, :mod:`socket`,
:mod:`ssl`, :mod:`struct`, :mod:`time`, :mod:`zlib`, as well as the
MicroPython-specific :mod:`machine` module. All other built-in modules
cannot be extended from the filesystem.

This allows the user to provide an extended implementation of a built-in library
(perhaps to provide additional CPython compatibility or missing functionality).
This is used extensively in :term:`micropython-lib`, see :ref:`packages` for
more information. The filesystem module will typically do a wildcard import of
the built-in module in order to inherit all the globals (classes, functions and
variables) from the built-in.

In MicroPython v1.21.0 and higher, to prevent the filesystem module from
importing itself, it can force an import of the built-in module by
temporarily clearing ``sys.path`` during the import. For example, to extend the
``time`` module from Python, a file named ``time.py`` on the filesystem would
do the following::

  _path = sys.path
  sys.path = ()
  try:
    from time import *
  finally:
    sys.path = _path
    del _path

  def extra_method():
    pass

The result is that ``time.py`` contains all the globals of the built-in ``time``
module, but adds ``extra_method``.

In earlier versions of MicroPython, you can force an import of a built-in module
by appending a ``u`` to the start of its name. For example, ``import utime``
instead of ``import time``. For instance, ``time.py`` on the filesystem could
look like::

  from utime import *

  def extra_method():
    pass

This way is still supported, but the ``sys.path`` method described above is now
preferred as the ``u``-prefix will be removed from the names of built-in
modules in a future version of MicroPython.

*Other than when it specifically needs to force the use of the built-in module,
code should always use* ``import module`` *rather than* ``import umodule``.
