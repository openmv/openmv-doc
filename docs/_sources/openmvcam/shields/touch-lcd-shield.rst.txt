Touch LCD Shield
================

The Touch LCD Shield gives the OpenMV Cam a 2.3 inch 320x240 capacitive multi-touch display so you can preview the camera output (and accept input) without a host computer. Two Qwiic headers make it easy to chain extra I2C devices.

.. image:: ../touch-lcd-shield-hero.jpg
    :alt: Touch LCD Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Touch LCD Shield product page <https://openmv.io/products/touch-lcd-shield>`_.

Highlights
----------

* 2.3 inch TFT LCD, 320x240, 16-bit RGB565
* Capacitive multi-touch input
* PWM-controllable backlight
* Two Qwiic connectors for easy I2C device chaining

Pinout
------

.. image:: ../pinout-touch-lcd-shield.png
    :alt: Touch LCD Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P0",        "LCD MOSI (SPI data to display)"
   "P1",        "LCD TE (tearing-effect output)"
   "P2",        "LCD SCLK (SPI clock)"
   "P3",        "LCD SSEL (SPI chip select)"
   "P4",        "Touch / Qwiic SCL (I²C clock — shared with Qwiic headers)"
   "P5",        "Touch / Qwiic SDA (I²C data — shared with Qwiic headers)"
   "P6",        "LCD backlight"
   "P7",        "Touch / LCD RESET_N"
   "P8",        "LCD RS (data / command select)"
   "P9",        "Touch INT_N"
   "3.3V rail", "Powers the LCD and touch controllers"
   "GND rail",  "Common ground"

Usage
-----

Drive the shield through the :class:`display.SPIDisplay` class.
Stream camera frames to the 320×240 LCD::

    import csi
    import display
    import image
    import time

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.QVGA)

    lcd = display.SPIDisplay(width=320, height=240, bgr=True)
    clock = time.clock()

    while True:
        clock.tick()
        lcd.write(csi0.snapshot(), hint=image.CENTER | image.SCALE_ASPECT_KEEP)
        print(clock.fps())

Drive the backlight via PWM for adjustable brightness. Wrap
:class:`machine.PWM` in a small backlight controller class and pass
it to :class:`~display.SPIDisplay` through its ``backlight``
argument — :class:`~display.SPIDisplay` calls ``backlight(value)`` on
the object whenever it needs to update the level::

    import display
    from machine import Pin, PWM


    class PWMBacklight:
        """Drives a backlight pin with machine.PWM (0–100 %)."""

        def __init__(self, pin, frequency=200):
            self._pwm = PWM(Pin(pin), freq=frequency, duty_u16=0)

        def backlight(self, value):
            self._pwm.duty_u16(int(value * 65535 / 100))

        def deinit(self):
            self._pwm.deinit()


    lcd = display.SPIDisplay(width=320, height=240, bgr=True,
                             backlight=PWMBacklight("P6"))
    lcd.backlight(50)  # 0–100

The on-board GT911 capacitive controller is wired to the camera's I²C
bus on P4/P5, with reset on P7 and interrupt on P9. Read multi-touch
data through the :class:`gt911.GT911` class::

    from machine import I2C, Pin
    import gt911
    import time

    bus = I2C(scl=Pin("P4"), sda=Pin("P5"), freq=400_000)
    touch = gt911.GT911(bus, reset_pin="P7", irq_pin="P9",
                        width=320, height=240, touch_points=5)

    while True:
        n, points = touch.read_points()
        for i in range(n):
            x, y, size, tid = points[i]
            print("touch", tid, "->", x, y)
        time.sleep_ms(20)

.. warning::

   This page is under construction.
