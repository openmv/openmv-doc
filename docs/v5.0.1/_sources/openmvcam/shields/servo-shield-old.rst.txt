Servo Shield
============

The Servo Shield drives up to eight hobby servos in parallel from the OpenMV Cam over I2C, using a PCA9685 servo / PWM controller.

.. image:: ../servo-shield-old-hero.jpg
    :alt: Servo Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Servo Shield product page <https://openmv.io/products/servo-shield>`_.

Highlights
----------

* PCA9685 servo / PWM controller
* Eight independent servo channels over I2C
* Stacks with the Motor Shield and Pan and Tilt Shield

Pinout
------

.. image:: ../pinout-servo-shield-old.png
    :alt: Servo Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P4",        "I²C SCL — clock to the PCA9685"
   "P5",        "I²C SDA — data to the PCA9685"
   "VIN rail",  "Powers the servos (from the camera's VIN pin)"
   "3.3V rail", "Powers the PCA9685 logic"
   "GND rail",  "Servo and camera common ground"

The default I²C address is ``0x40``. Connect the on-board solder
bridge to move the address to ``0x60``.

.. note::

   The shield draws servo power straight from the camera's VIN pin.
   USB does not feed VIN on any OpenMV Cam, so VIN must be supplied
   externally (battery, bench supply, or similar) — pick a source
   rated for the combined stall current of every servo you plan to
   drive.

Usage
-----

Drive the eight servo channels through the PCA9685 over I²C. The
pulse-width range varies between servos, so tune ``MIN_US`` and
``MAX_US`` to match yours — typical values are around 1000–2000 µs::

    import time
    from machine import SoftI2C, Pin


    class PCA9685:
        """Minimal PCA9685 driver — 12-bit PWM on any of 8 channels."""

        def __init__(self, bus, address=0x40, freq=50):
            self._bus = bus
            self._addr = address
            bus.writeto_mem(address, 0x00, b"\x00")            # reset Mode1
            prescale = round(25_000_000 / (4096 * freq)) - 1
            bus.writeto_mem(address, 0x00, b"\x10")            # sleep
            bus.writeto_mem(address, 0xFE, bytes([prescale]))  # prescale
            bus.writeto_mem(address, 0x00, b"\x00")            # wake
            time.sleep_us(5)
            bus.writeto_mem(address, 0x00, b"\xA1")            # restart + AI + allcall
            self._period_us = 1_000_000 // freq

        def set_duty(self, channel, duty):
            duty &= 0xFFF                                      # 12-bit
            if duty == 0:
                on, off = 0, 0x1000                            # FULL_OFF
            elif duty == 0xFFF:
                on, off = 0x1000, 0                            # FULL_ON
            else:
                on, off = 0, duty
            self._bus.writeto_mem(
                self._addr, 0x06 + 4 * channel,
                bytes([on & 0xFF, on >> 8, off & 0xFF, off >> 8]))

        def set_us(self, channel, pulse_us):
            self.set_duty(channel, (pulse_us * 4096) // self._period_us)


    MIN_US = 1000  # full-left pulse width (microseconds)
    MAX_US = 2000  # full-right pulse width

    bus = SoftI2C(scl=Pin("P4"), sda=Pin("P5"))
    pca = PCA9685(bus, address=0x40, freq=50)


    def angle(channel, deg):
        pca.set_us(channel, MIN_US + (deg * (MAX_US - MIN_US)) // 180)


    while True:
        for ch in range(8):
            angle(ch, 0)
        time.sleep_ms(2000)
        for ch in range(8):
            angle(ch, 180)
        time.sleep_ms(2000)

The PCA9685 also handles general 12-bit PWM at any frequency — reuse
the same class with ``set_duty`` (0–4095) to, for example, fade an
LED on channel 0 at 1 kHz. The helper below scales a 0.0–100.0%
float onto the chip's 0–4095 duty range::

    import time
    from machine import SoftI2C, Pin

    bus = SoftI2C(scl=Pin("P4"), sda=Pin("P5"))
    pca = PCA9685(bus, address=0x40, freq=1000)


    def brightness(channel, pct):
        pca.set_duty(channel, int(pct * 4095 / 100))


    while True:
        # Ramp up 0 → 100%.
        for pct in range(101):
            brightness(0, float(pct))
            time.sleep_ms(20)
        # Ramp down 100 → 0%.
        for pct in reversed(range(101)):
            brightness(0, float(pct))
            time.sleep_ms(20)
