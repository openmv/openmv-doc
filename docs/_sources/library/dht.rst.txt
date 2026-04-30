:mod:`dht` --- DHT11 and DHT22 temperature/humidity sensors
===========================================================

.. module:: dht
   :synopsis: DHT11 and DHT22 temperature/humidity sensor driver

The :mod:`dht` module provides drivers for the DHT11 and DHT22 (also known
as AM2302) low-cost temperature and humidity sensors. The single-wire
protocol is implemented in C by the underlying port (``machine.dht_readinto``,
``esp.dht_readinto`` or ``pyb.dht_readinto`` depending on platform).

Example::

    from machine import Pin
    from dht import DHT22

    d = DHT22(Pin(4))
    d.measure()
    print(d.temperature(), d.humidity())

Classes
-------

.. class:: DHTBase(pin: machine.Pin)

   Base class for DHT sensors. Not normally instantiated directly --- use
   :class:`DHT11` or :class:`DHT22` instead.

   .. method:: measure() -> None

      Trigger a measurement on the sensor and read the 5-byte response
      into the internal buffer. Raises :exc:`Exception` with the message
      ``"checksum error"`` if the data checksum is invalid.

      Call this method before reading :meth:`temperature` or
      :meth:`humidity`. The DHT sensors require at least 1 second
      (DHT11) or 2 seconds (DHT22) between consecutive measurements.

.. class:: DHT11(pin: machine.Pin)

   Driver for the DHT11 sensor. Connect the sensor's data line to *pin*
   (a :py:class:`machine.Pin`). The DHT11 reports integer values with 1
   percent relative humidity and 1 degree Celsius resolution.

   .. method:: humidity() -> int

      Return the relative humidity from the most recent :meth:`measure`
      call, as an integer percentage (0--100).

   .. method:: temperature() -> int

      Return the temperature from the most recent :meth:`measure` call,
      as an integer in degrees Celsius.

.. class:: DHT22(pin: machine.Pin)

   Driver for the DHT22 / AM2302 sensor. Connect the sensor's data line
   to *pin* (a :py:class:`machine.Pin`). The DHT22 reports values with 0.1
   percent relative humidity and 0.1 degree Celsius resolution, and
   supports negative temperatures.

   .. method:: humidity() -> float

      Return the relative humidity from the most recent :meth:`measure`
      call, as a ``float`` percentage (0.0--100.0).

   .. method:: temperature() -> float

      Return the temperature from the most recent :meth:`measure` call,
      as a ``float`` in degrees Celsius. Negative values are supported.
