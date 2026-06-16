Debouncing
==========

A switch is drawn as a perfect open-or-closed contact, but a
real switch's contacts do not snap cleanly between the two
states. They *chatter* -- make and break electrical contact
many times within a few milliseconds before settling. A GPIO
input reading the pin sees that as a burst of edges; a careless
polling loop counts several "presses" for one real press, and
an interrupt handler runs several times per actual press.

.. figure:: ../figures/switch-bounce.svg
   :alt: An idealised scope trace showing a switch input
         signal. The signal starts high (open switch), drops
         low, bounces back and forth several times within a
         few milliseconds, then settles low (closed switch).

   A bouncing switch produces a burst of fast transitions
   before settling.

*Debouncing* is the practice of filtering the chatter so that
each physical press registers as a single event. Two approaches
solve this -- software (a timing rule in firmware) or hardware
(a small filter on the wire). They are not mutually exclusive.

Software debouncing
-------------------

The idea is to remember when the input last changed and reject
further changes within a short window of that timestamp.
Contact bounce typically lasts under 10 ms; a real press takes
50 -- 100 ms; a 30 -- 50 ms window catches all bounces without
blocking real presses.

In a polling loop, read the pin, compare to the last stable
value, and only accept a change after the debounce window has
elapsed:

::

    import time
    from machine import Pin

    button = Pin("P0", Pin.IN, Pin.PULL_UP)
    last_state  = 1
    last_change = 0
    DEBOUNCE_MS = 50

    while True:
        now = time.ticks_ms()
        state = button.value()
        if state != last_state and time.ticks_diff(now, last_change) > DEBOUNCE_MS:
            last_change = now
            last_state = state
            if state == 0:
                do_action()
        time.sleep_ms(10)

For interrupt-driven reads, apply the same timing rule inside
the handler, then hand the real press off to main context via
:func:`micropython.schedule` (see :doc:`gpio-input`):

::

    import time
    import micropython
    from machine import Pin

    button = Pin("P0", Pin.IN, Pin.PULL_UP)
    last_irq = 0
    DEBOUNCE_MS = 50

    def handle_press(pin):
        do_action()

    def on_press(pin):
        global last_irq
        now = time.ticks_ms()
        if time.ticks_diff(now, last_irq) < DEBOUNCE_MS:
            return
        last_irq = now
        micropython.schedule(handle_press, pin)

    button.irq(handler=on_press, trigger=Pin.IRQ_FALLING)

The ISR filters bounces by timestamp and queues the callback;
``handle_press`` runs back in main context, where allocation
and slow I/O are safe.

Hardware debouncing
-------------------

Hardware debouncing filters the chatter electrically, before
it ever reaches the pin. The standard tool is a capacitor.

A capacitor is a two-terminal component that stores electric
charge. Physically, it is two conductive plates held a short
distance apart, separated by an insulator (the *dielectric*).

.. figure:: ../figures/capacitor.svg
   :alt: A capacitor drawn as two parallel horizontal plates
         with a dielectric (insulator) between them. A lead
         connects each plate to an external terminal -- A on
         top, B on bottom. Equal and opposite charges +Q and
         -Q accumulate on the two plates when a voltage V is
         applied across the terminals.

   A parallel-plate capacitor: two conductors separated by an
   insulating layer.

Applying a voltage across its terminals drives equal and
opposite charges onto the two plates; the relationship is

::

    Q = C × V

where ``Q`` is the stored charge (coulombs), ``V`` is the
voltage across the capacitor, and ``C`` is its *capacitance*
(farads). Capacitance is fixed by the device's construction;
more capacitance means more charge stored at the same voltage.

The consequence: a capacitor cannot change its voltage
instantly. Charge flowing in or out has to pass through
whatever resistance is in the path, and that resistance sets
how fast the voltage can change.

RC time constant
~~~~~~~~~~~~~~~~

Charging a capacitor through a resistor produces a smooth
exponential rise toward the supply voltage, not a step. The
characteristic time of that rise is the RC time constant:

::

    τ = R × C

After one ``τ``, the capacitor has reached about 63 % of the
supply voltage. After 5 ``τ``, it is over 99 % -- "fully
charged" for practical purposes.

.. figure:: ../figures/rc-charging.svg
   :alt: A graph showing a capacitor's voltage rising along
         an exponential curve from 0 V toward the supply rail.
         The time τ = RC is marked on the x-axis where the
         curve reaches 63 % of the supply voltage.

   A capacitor charges along an exponential curve. ``τ = RC``
   is the time to reach 63 % of the final voltage.

Discharging through a resistor follows the mirror image: the
voltage falls exponentially from its initial value toward
zero, dropping to 37 % of the starting voltage after one
``τ``, and to under 1 % after 5 ``τ``.

.. figure:: ../figures/rc-discharging.svg
   :alt: A graph showing a capacitor's voltage falling along
         an exponential curve from Vmax toward 0 V. The time
         τ = RC is marked on the x-axis where the curve drops
         to 37 % of the starting voltage.

   A capacitor discharges along an exponential decay.
   ``τ = RC`` is the time to fall to 37 % of the starting
   voltage.

The debounce circuit
~~~~~~~~~~~~~~~~~~~~

A capacitor between an input pin and ground, fed through a
series resistor, forms a *low-pass filter*. Fast spikes do not
have time to charge or discharge the capacitor through that
resistor; the pin stays close to whatever voltage it was at
before the spike. Slow changes -- a deliberate press -- charge
or discharge the capacitor and the reading follows.

``R1`` pulls the switch's high side up to Vcc, producing a
raw switch signal that bounces. ``R2`` and ``C`` then
low-pass-filter that signal into the pin:

.. figure:: ../figures/debounce-circuit.svg
   :alt: A switch input with hardware debouncing. Vcc connects
         through a 10 kΩ pull-up resistor down to a junction.
         That junction connects to ground through the switch
         on one branch, and through a 10 kΩ series resistor to
         the Pin on the other branch. A 100 nF capacitor
         between Pin and ground completes the low-pass filter.

   Hardware debouncing: ``R2`` and ``C`` low-pass-filter the
   raw switch signal before it reaches the pin.

Typical values: ``R1 = 10 kΩ`` (pull-up), ``R2 = 10 kΩ``
(series), ``C = 100 nF``.

When the switch is open, current flows Vcc → ``R1`` → ``R2``
→ cap (in series), charging the cap to Vcc with
``τ_charge = (R1 + R2) × C = 2 ms``.

When the switch closes, the switch node clamps to ground and
the cap drains through ``R2`` alone to that ground with
``τ_discharge = R2 × C = 1 ms``.

Both edges are RC-filtered. Because the cap sits on its own
node, downstream of ``R2`` from the switch, it swings cleanly
between Vcc (open) and 0 V (closed) -- no current has to flow
through ``R1`` at steady state in either case.

Choosing between them
---------------------

* **Software** is the default. It costs nothing in
  components, the threshold is easy to tune, and it works on
  any pin that the CPU reads.
* **Hardware** is worth the parts when the bounce reaches
  something other than the CPU's polling code -- an interrupt
  that must not double-fire, a hardware counter, a peripheral
  with no filter of its own.

Software and hardware debouncing also coexist peacefully:
a small RC filter suppresses the worst spikes, and a software
debounce window covers what is left.
