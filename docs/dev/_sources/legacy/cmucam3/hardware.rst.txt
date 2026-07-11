Hardware Architecture
=====================

CMUcam3 Hardware Connections
----------------------------

* :doc:`hardware-power`
* :doc:`hardware-serial`
* :doc:`camera-bus`
* :doc:`hardware-servo`
* :doc:`hardware-gpio-port`
* :doc:`Analog Output Port <analog-out>`
* :doc:`hardware-leds`
* :doc:`hardware-isp`
* :doc:`hardware-lens`
* :doc:`wsn`

Hardware Characteristics
------------------------

.. list-table::
   :header-rows: 1

   * - Power State
     - Active Current
     - Idle Current
     - Voltage
   * - All Active
     - 130mA
     - 25mA
     - 5V
   * - External Regulator Disabled
     - n/a
     - 0.01uA
     - 5V
   * - CPU (@60Mhz)
     - 30mA
     - 10uA
     - 1.8V
   * - CPU Peripherals
     - 30mA
     - 10uA
     - 3.3V
   * - CMOS Camera
     - 25mA
     - 10uA
     - 5V
   * - MAX232
     - 8mA
     - n/a
     - 3.3V
   * - Video FIFO
     - 52mA
     - 14mA
     - 3.3V
   * - MMC card
     - 4mA
     - 4mA
     - 3.3V
   * - Misc
     - 10mA
     - 10mA
     - 3.3V

* RAM: 64KB
* FLASH: 128KB
* Frequency: 14-60Mhz
* Capacity: AL440B (512KB) or AL4V8M440 (1MB)
* Max Rate: 50 FPS
* Max Resolution: 352x288
* Color Depth: 8bits per pixel
* max serial rate: 115,200 bits per second
* qcif image load and pixel touch rate: 26 FPS
* Servo Frequency: 50 Hz
* Servo Resolution: 8 or 10 bit
