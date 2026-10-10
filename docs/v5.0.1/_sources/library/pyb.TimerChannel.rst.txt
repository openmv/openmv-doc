.. currentmodule:: pyb
.. _pyb.TimerChannel:

class TimerChannel -- setup a channel for a timer
=================================================

A :class:`TimerChannel` represents one of the output-compare or
input-capture channels of a :class:`Timer`. Channels are not
constructed directly; they are returned by :meth:`Timer.channel`,
which both configures the channel and hands back the wrapper object::

    timer = pyb.Timer(2, freq=1000)
    ch2 = timer.channel(2, pyb.Timer.PWM, pin=pyb.Pin.board.P1,
                        pulse_width_percent=25)

The methods below adjust the channel's compare/capture register at
runtime and install per-channel callbacks.

Constructors
------------

.. class:: TimerChannel

   :class:`TimerChannel` objects are not constructed directly. Use
   :meth:`Timer.channel` to obtain one.

   Methods
   -------

   .. method:: callback(fun: Optional[Callable[[Timer], None]]) -> None

      Set the function to be called when the timer channel triggers.
      ``fun`` is passed 1 argument, the timer object.
      If ``fun`` is ``None`` then the callback will be disabled.

   .. method:: capture(value: Optional[int] = None) -> Optional[int]

      Get or set the capture value associated with a channel.
      capture, compare, and pulse_width are all aliases for the same function.
      capture is the logical name to use when the channel is in input capture mode.

   .. method:: compare(value: Optional[int] = None) -> Optional[int]

      Get or set the compare value associated with a channel.
      capture, compare, and pulse_width are all aliases for the same function.
      compare is the logical name to use when the channel is in output compare mode.

   .. method:: pulse_width(value: Optional[int] = None) -> Optional[int]

      Get or set the pulse width value associated with a channel.
      capture, compare, and pulse_width are all aliases for the same function.
      pulse_width is the logical name to use when the channel is in PWM mode.

      In edge aligned mode, a pulse_width of ``period + 1`` corresponds to a duty cycle of 100%
      In center aligned mode, a pulse width of ``period`` corresponds to a duty cycle of 100%

   .. method:: pulse_width_percent(value: Optional[Union[int, float]] = None) -> Optional[Union[int, float]]

      Get or set the pulse width percentage associated with a channel.  The value
      is a number between 0 and 100 and sets the percentage of the timer period
      for which the pulse is active.  The value can be an integer or
      floating-point number for more accuracy.  For example, a value of 25 gives
      a duty cycle of 25%.
