.. currentmodule:: pyb
.. _pyb.Timer:

class Timer -- control internal timers
======================================

Timers can be used for a great variety of tasks.  At the moment, only
the simplest case is implemented: that of calling a function periodically.

Each timer consists of a counter that counts up at a certain rate.  The rate
at which it counts is the peripheral clock frequency (in Hz) divided by the
timer prescaler.  When the counter reaches the timer period it triggers an
event, and the counter resets back to zero.  By using the callback method,
the timer event can call a Python function.

Example usage to toggle an LED at a fixed frequency::

    tim = pyb.Timer(4)              # create a timer object using timer 4
    tim.init(freq=2)                # trigger at 2Hz
    tim.callback(lambda t:pyb.LED(1).toggle())

Example using named function for the callback::

    def tick(timer):                # we will receive the timer object when being called
        print(timer.counter())      # show current timer's counter value
    tim = pyb.Timer(4, freq=1)      # create a timer object using timer 4 - trigger at 1Hz
    tim.callback(tick)              # set the callback to our tick function

Further examples::

    tim = pyb.Timer(4, freq=100)    # freq in Hz
    tim = pyb.Timer(4, prescaler=0, period=99)
    tim.counter()                   # get counter (can also set)
    tim.prescaler(2)                # set prescaler (can also get)
    tim.period(199)                 # set period (can also get)
    tim.callback(lambda t: ...)     # set callback for update interrupt (t=tim instance)
    tim.callback(None)              # clear callback

*Note:* Timer(1) is used for the camera.  Similarly, Timer(5) controls the servo driver, and
Timer(6) is used for timed ADC/DAC reading/writing.  It is recommended to
use the other timers in your programs.

*Note:* Memory can't be allocated during a callback (an interrupt) and so
exceptions raised within a callback don't give much information.  See
:func:`micropython.alloc_emergency_exception_buf` for how to get around this
limitation.


Constructors
------------

.. class:: Timer(id: int, *args, **kwargs)

   Construct a new timer object of the given id.  If additional
   arguments are given, then the timer is initialised by ``init(...)``.
   The set of valid ``id`` values depends on the STM32 MCU on the OpenMV
   Cam in use; consult the STM32 reference manual for the available
   general-purpose and advanced-control timers.

   Methods
   -------

   .. method:: init(*, freq: Optional[Union[int, float]] = None, prescaler: Optional[int] = None, period: Optional[int] = None, mode: int = Timer.UP, div: int = 1, callback: Optional[Callable[[Timer], None]] = None, deadtime: int = 0, brk: int = Timer.BRK_OFF, hard: bool = True) -> None

      Initialise the timer.  Initialisation must be either by frequency (in Hz)
      or by prescaler and period::

          tim.init(freq=100)                  # set the timer to trigger at 100Hz
          tim.init(prescaler=83, period=999)  # set the prescaler and period directly

      Keyword arguments:

        - ``freq`` --- specifies the periodic frequency of the timer. You might also
          view this as the frequency with which the timer goes through one complete cycle.

        - ``prescaler`` [0-0xffff] - specifies the value to be loaded into the
          timer's Prescaler Register (PSC). The timer clock source is divided
          by ``(prescaler + 1)`` to derive the timer clock. The clock source
          comes from the timer's parent APB bus and is **MCU-dependent**.
          On STM32, timers on APB1 typically clock at ``2 * pclk1`` and
          timers on APB2 at ``2 * pclk2``; read the current bus frequencies
          with :func:`pyb.freq` and consult the STM32 reference manual for
          your OpenMV Cam's MCU.

        - ``period`` [0-0xffff] for timers 1, 3, 4, and 6-15. [0-0x3fffffff] for timers 2 & 5.
          Specifies the value to be loaded into the timer's AutoReload
          Register (ARR). This determines the period of the timer (i.e. when the
          counter cycles). The timer counter will roll-over after ``period + 1``
          timer clock cycles.

        - ``mode`` can be one of:

          - ``Timer.UP`` - configures the timer to count from 0 to ARR (default)
          - ``Timer.DOWN`` - configures the timer to count from ARR down to 0.
          - ``Timer.CENTER`` - configures the timer to count from 0 to ARR and
            then back down to 0.

        - ``div`` can be one of 1, 2, or 4. Divides the timer clock to determine
          the sampling clock used by the digital filters.

        - ``callback`` - as per Timer.callback()

        - ``deadtime`` - specifies the amount of "dead" or inactive time between
          transitions on complementary channels (both channels will be inactive
          for this time). ``deadtime`` may be an integer between 0 and 1008, with
          the following restrictions: 0-128 in steps of 1. 128-256 in steps of
          2, 256-512 in steps of 8, and 512-1008 in steps of 16. ``deadtime``
          measures ticks of ``source_freq`` divided by ``div`` clock ticks.
          ``deadtime`` is only available on timers 1 and 8.

        - ``brk`` - specifies if the break mode is used to kill the output of
          the PWM when the ``BRK_IN`` input is asserted. The value of this
          argument determines if break is enabled and what the polarity is, and
          can be one of ``Timer.BRK_OFF``, ``Timer.BRK_LOW`` or
          ``Timer.BRK_HIGH``. To select the ``BRK_IN`` pin construct a Pin object with
          ``mode=Pin.ALT, alt=Pin.AFn_TIMx``. The pin's GPIO input features are
          available in alt mode - ``pull=`` , ``value()`` and ``irq()``.

        - ``hard`` can be one of:

          - ``True`` - The callback will be executed in hard interrupt
            context, which minimises delay and jitter but is subject to the
            limitations described in :ref:`isr_rules` including being unable
            to allocate on the heap.
          - ``False`` - The callback will be scheduled as a soft interrupt,
            allowing it to allocate but possibly also introducing
            garbage-collection delays and jitter.

          The default value of this option is True.

       You must either specify freq or both of period and prescaler.

   .. method:: deinit() -> None

      Deinitialises the timer.

      Disables the callback (and the associated irq).

      Disables any channel callbacks (and the associated irq).
      Stops the timer, and disables the timer peripheral.

   .. method:: callback(fun: Optional[Callable[[Timer], None]]) -> None

      Set the function to be called when the timer triggers.
      ``fun`` is passed 1 argument, the timer object.
      If ``fun`` is ``None`` then the callback will be disabled.

   .. method:: channel(channel: int, mode: Optional[int] = None, *args, **kwargs) -> Optional[TimerChannel]

      If only a channel number is passed, then a previously initialized channel
      object is returned (or ``None`` if there is no previous channel).

      Otherwise, a TimerChannel object is initialized and returned.

      Each channel can be configured to perform pwm, output compare, or
      input capture. All channels share the same underlying timer, which means
      that they share the same timer clock.

      Keyword arguments:

        - ``mode`` can be one of:

          - ``Timer.PWM`` --- configure the timer in PWM mode (active high).
          - ``Timer.PWM_INVERTED`` --- configure the timer in PWM mode (active low).
          - ``Timer.OC_TIMING`` --- indicates that no pin is driven.
          - ``Timer.OC_ACTIVE`` --- the pin will be made active when a compare match occurs (active is determined by polarity)
          - ``Timer.OC_INACTIVE`` --- the pin will be made inactive when a compare match occurs.
          - ``Timer.OC_TOGGLE`` --- the pin will be toggled when a compare match occurs.
          - ``Timer.OC_FORCED_ACTIVE`` --- the pin is forced active (compare match is ignored).
          - ``Timer.OC_FORCED_INACTIVE`` --- the pin is forced inactive (compare match is ignored).
          - ``Timer.IC`` --- configure the timer in Input Capture mode.
          - ``Timer.ENC_A`` --- configure the timer in Encoder mode. The counter only changes when CH1 changes.
          - ``Timer.ENC_B`` --- configure the timer in Encoder mode. The counter only changes when CH2 changes.
          - ``Timer.ENC_AB`` --- configure the timer in Encoder mode. The counter changes when CH1 or CH2 changes.

        - ``callback`` - as per TimerChannel.callback()

        - ``pin`` None (the default) or a Pin object. If specified (and not None)
          this will cause the alternate function of the indicated pin
          to be configured for this timer channel. An error will be raised if
          the pin doesn't support any alternate functions for this timer channel.

      Keyword arguments for Timer.PWM modes:

        - ``pulse_width`` - determines the initial pulse width value to use.
        - ``pulse_width_percent`` - determines the initial pulse width percentage to use.

      Keyword arguments for Timer.OC modes:

        - ``compare`` - determines the initial value of the compare register.

        - ``polarity`` can be one of:

          - ``Timer.HIGH`` - output is active high
          - ``Timer.LOW`` - output is active low

      Optional keyword arguments for Timer.IC modes:

        - ``polarity`` can be one of:

          - ``Timer.RISING`` - captures on rising edge.
          - ``Timer.FALLING`` - captures on falling edge.
          - ``Timer.BOTH`` - captures on both edges.

        Note that capture only works on the primary channel, and not on the
        complementary channels.

      Notes for Timer.ENC modes:

        - Requires 2 pins, so one or both pins will need to be configured to use
          the appropriate timer AF using the Pin API.
        - Read the encoder value using the timer.counter() method.
        - Only works on CH1 and CH2 (and not on CH1N or CH2N)
        - The channel number is ignored when setting the encoder mode.

      PWM example -- on every STM32 OpenMV Cam ``TIM4`` channels 1
      and 2 are routed to header pins ``P7`` and ``P8`` respectively::

          timer = pyb.Timer(4, freq=1000)
          ch1 = timer.channel(1, pyb.Timer.PWM, pin=pyb.Pin.board.P7,
                              pulse_width=8000)
          ch2 = timer.channel(2, pyb.Timer.PWM, pin=pyb.Pin.board.P8,
                              pulse_width=16000)

   .. method:: counter(value: Optional[int] = None) -> Optional[int]

      Get or set the timer counter.

   .. method:: freq(value: Optional[Union[int, float]] = None) -> Optional[Union[int, float]]

      Get or set the frequency for the timer (changes prescaler and period if set).

   .. method:: period(value: Optional[int] = None) -> Optional[int]

      Get or set the period of the timer.

   .. method:: prescaler(value: Optional[int] = None) -> Optional[int]

      Get or set the prescaler for the timer.

   .. method:: source_freq() -> int

      Get the frequency of the source of the timer.

   Constants
   ---------

   Counter-mode constants (``mode`` argument of :meth:`init`):

   .. data:: UP
      :type: int

      Count from ``0`` up to ARR (the default mode).

   .. data:: DOWN
      :type: int

      Count from ARR down to ``0``.

   .. data:: CENTER
      :type: int

      Count from ``0`` up to ARR and then back down to ``0``.

   Break-mode constants (``brk`` argument of :meth:`init`):

   .. data:: BRK_OFF
      :type: int

      Break input is disabled.

   .. data:: BRK_LOW
      :type: int

      Break input is active-low.

   .. data:: BRK_HIGH
      :type: int

      Break input is active-high.

   Channel-mode constants (``mode`` argument of :meth:`channel`):

   .. data:: PWM
      :type: int

      Configure the channel for PWM output (active high).

   .. data:: PWM_INVERTED
      :type: int

      Configure the channel for PWM output (active low).

   .. data:: OC_TIMING
      :type: int

      Output-compare timing mode; no pin is driven.

   .. data:: OC_ACTIVE
      :type: int

      Output-compare active mode; the pin is made active on compare match.

   .. data:: OC_INACTIVE
      :type: int

      Output-compare inactive mode; the pin is made inactive on compare match.

   .. data:: OC_TOGGLE
      :type: int

      Output-compare toggle mode; the pin toggles on compare match.

   .. data:: OC_FORCED_ACTIVE
      :type: int

      Output-compare forced-active mode; the pin is forced active and the
      compare match is ignored.

   .. data:: OC_FORCED_INACTIVE
      :type: int

      Output-compare forced-inactive mode; the pin is forced inactive and
      the compare match is ignored.

   .. data:: IC
      :type: int

      Configure the channel for input-capture mode.

   .. data:: ENC_A
      :type: int

      Encoder mode: the counter only changes when CH1 changes.

   .. data:: ENC_B
      :type: int

      Encoder mode: the counter only changes when CH2 changes.

   .. data:: ENC_AB
      :type: int

      Encoder mode: the counter changes whenever CH1 or CH2 changes.

   Output-compare polarity (``polarity`` argument of :meth:`channel` in
   OC modes):

   .. data:: HIGH
      :type: int

      Output is active-high.

   .. data:: LOW
      :type: int

      Output is active-low.

   Input-capture polarity (``polarity`` argument of :meth:`channel` in
   IC mode):

   .. data:: RISING
      :type: int

      Capture on the rising edge.

   .. data:: FALLING
      :type: int

      Capture on the falling edge.

   .. data:: BOTH
      :type: int

      Capture on either edge.
