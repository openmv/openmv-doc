.. currentmodule:: pyb
.. _pyb.ADC:

class ADC -- analog to digital conversion
=========================================

Usage::

    import pyb

    adc = pyb.ADC("P6")
    val = adc.read()

See :class:`pyb.ADCAll` for simultaneous access to every ADC channel
plus the MCU's internal die-temperature, ``VBAT`` and ``VREFINT``
sensors.


Constructors
------------

.. class:: ADC(pin: Union[int, str, Pin])

   Create an ADC object associated with the given pin.
   This allows you to then read analog values on that pin.

   Methods
   -------

   .. method:: read() -> int

      Read the value on the analog pin and return it.  The returned value
      will be between 0 and 4095.

   .. method:: read_timed(buf: Union[bytearray, "array.array"], timer: Union[Timer, int]) -> int

      Read analog values into ``buf`` at a rate set by the ``timer`` object.

      ``buf`` can be bytearray or array.array for example.  The ADC values have
      12-bit resolution and are stored directly into ``buf`` if its element size is
      16 bits or greater.  If ``buf`` has only 8-bit elements (eg a bytearray) then
      the sample resolution will be reduced to 8 bits.

      ``timer`` should be a Timer object, and a sample is read each time the timer
      triggers.  The timer must already be initialised and running at the desired
      sampling frequency.

      To support previous behaviour of this function, ``timer`` can also be an
      integer which specifies the frequency (in Hz) to sample at.  In this case
      Timer(6) will be automatically configured to run at the given frequency.

      Example using a Timer object (preferred way)::

          adc = pyb.ADC(pyb.Pin.board.P6)    # create an ADC on pin P6
          tim = pyb.Timer(6, freq=10)        # create a timer running at 10Hz
          buf = bytearray(100)               # buffer to hold the samples
          adc.read_timed(buf, tim)           # sample 100 values, taking 10s

      Example using an integer for the frequency::

          adc = pyb.ADC(pyb.Pin.board.P6)    # create an ADC on pin P6
          buf = bytearray(100)               # buffer of 100 bytes
          adc.read_timed(buf, 10)            # read 100 samples at 10Hz (10s total)

          for val in buf:
              print(val)

      This function does not allocate any heap memory. It has blocking behaviour:
      it does not return to the calling program until the buffer is full.

   .. staticmethod:: read_timed_multi(adcs: Tuple[ADC, ...], bufs: Tuple[Union[bytearray, "array.array"], ...], timer: Timer) -> bool

      Extract relative timing or phase data from multiple ADCs.

      Reads analog values from multiple ADCs into buffers at a rate set
      by the *timer* object. Each time the timer triggers a sample is
      rapidly read from each ADC in turn.

      ADC and buffer instances are passed in tuples with each ADC having an
      associated buffer. All buffers must be of the same type and length and
      the number of buffers must equal the number of ADC's.

      Buffers can be ``bytearray`` or ``array.array`` for example. The ADC values
      have 12-bit resolution and are stored directly into the buffer if its element
      size is 16 bits or greater.  If buffers have only 8-bit elements (eg a
      ``bytearray``) then the sample resolution will be reduced to 8 bits.

      *timer* must be a Timer object. The timer must already be initialised
      and running at the desired sampling frequency.

      The STM32 OpenMV Cams expose only one ADC-capable header pin
      (``P6``), so on stock hardware ``read_timed_multi`` is only
      useful with a single ADC. Wire up additional analog inputs via
      :class:`pyb.Pin` ``cpu`` references to use it with more than
      one ADC.

      Example reading one ADC::

          import array

          adc = pyb.ADC(pyb.Pin.board.P6)
          tim = pyb.Timer(8, freq=100)
          rx = array.array("H", (0 for i in range(100)))

          # Sample 100 values at 100Hz (takes one second).
          pyb.ADC.read_timed_multi((adc,), (rx,), tim)

          for val in rx:
              print(val)

      This function does not allocate any heap memory. It has blocking behaviour:
      it does not return to the calling program until the buffers are full.

      The function returns ``True`` if all samples were acquired with correct
      timing. At high sample rates the time taken to acquire a set of samples
      can exceed the timer period. In this case the function returns ``False``,
      indicating a loss of precision in the sample interval. In extreme cases
      samples may be missed.

      The maximum rate depends on factors including the data width and the
      number of ADC's being read. In testing two ADC's were sampled at a timer
      rate of 210kHz without overrun. Samples were missed at 215kHz.  For three
      ADC's the limit is around 140kHz, and for four it is around 110kHz.
      At high sample rates disabling interrupts for the duration can reduce the
      risk of sporadic data loss.

