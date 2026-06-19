DC motor control
================

A DC brushed motor is a coil of wire on a shaft inside a
magnetic field. Pass current through the coil and the field
exerts a force on it; the force becomes torque on the shaft.
Brushes inside the motor switch the current direction in the
coil as the shaft turns, so the torque always pushes the shaft
in the same direction. Apply a DC voltage across the two motor
leads and the shaft spins; swap the polarity and it spins the
other way.

Motors typically want hundreds of milliamps to several amps,
at supply voltages above the camera's 3.3 V logic rail. A GPIO
pin can source on the order of 25 mA and cannot reverse
polarity -- it can only drive its two rails. The drive stage
between the camera and the motor has to carry the motor's
current, route a separate higher-voltage motor supply, and let
the camera reverse the polarity on command. The
four-transistor *H-bridge* is the standard answer.

The H-bridge
------------

An H-bridge is four switches arranged in an H around the motor:

.. figure:: ../figures/h-bridge.svg
   :alt: An H-bridge schematic. Vmotor at top connects through
         switch S1 down to a node A on the left, and through
         switch S2 down to a node B on the right. The motor M
         sits horizontally between A and B. From A another
         switch S3 goes down to ground; from B another switch
         S4 goes down to ground.

   The H-bridge: four switches (``S1`` -- ``S4``) connect the
   motor ``M`` between Vmotor and ground.

Closing different pairs of switches selects what the motor
sees at its leads:

* **S1 + S4 closed, S2 + S3 open.** Current flows from Vmotor
  through ``S1``, into ``A``, across the motor to ``B``, and
  through ``S4`` to ground. The motor turns one way.
* **S2 + S3 closed, S1 + S4 open.** Current flows the other
  way through the motor. The motor turns the other way.
* **All four open.** Both motor leads float; the motor coasts.
* **S3 + S4 closed (or S1 + S2 closed).** Both motor leads are
  tied to the same rail; the motor's own kinetic energy drives
  a current that the closed pair shorts out as heat. The motor
  brakes.

The illegal combination is closing both switches in the same
column -- ``S1 + S3`` or ``S2 + S4`` -- which forms a short
circuit from Vmotor straight to ground. This is *shoot-through*,
and the camera's code must not allow it.

In practice the four switches are MOSFETs (introduced on the
:doc:`../gpio-output/level-shifting` page) inside an
integrated driver IC. The chip exposes two or three
logic-level input pins that map internally to the four
switches and includes interlock logic that prevents
shoot-through, so the camera's code does not have to manage
it directly.

PWM and the motor's inductance
------------------------------

Setting the motor's *speed* needs more than full-on and
full-off. The trick is the same one used for LEDs in
:doc:`led-dimming`: pulse the drive at a high frequency and
let the load average the result. For an LED the averager was
the eye; for a motor it is the coil itself.

A motor coil has substantial inductance. The current through
an inductor cannot change instantaneously; it changes at a
rate proportional to the voltage across it. Pulsing the
bridge on and off at 20 kHz ramps the coil current up during
each on-phase, and during the off-phase the current has to
keep flowing -- the coil reverses the voltage across itself to
maintain it.

Without somewhere to go, that current would spike the voltage
across the just-opened switch upward and could damage the
transistor. *Freewheeling diodes* across each switch -- often
just the MOSFETs' own body diodes inside the driver chip --
give the current the path it needs. It flows through a diode
and back around through one of the still-closed switches,
completing a *freewheel loop* in which the current decays
gradually through the small resistances of the bridge and the
motor itself. The diode also pins the voltage across the
opened switch within a diode drop of whichever rail the loop
returns to, well inside the MOSFET's safe operating area.

The current's *average* over each PWM period is what produces
torque, and that average tracks the duty cycle linearly --
doubling the duty roughly doubles the torque, and at constant
load roughly doubles the speed. Unlike LED dimming, where the
eye's non-linear response calls for a curve, a linear sweep of
``duty_u16`` already corresponds to a linear sweep of motor
effort.

The PWM frequency only has to clear two thresholds:

* Above ~20 kHz the carrier is outside the human audible band.
  Below that, the magnetic force on the coil ramps up and down
  with each PWM pulse and the windings and laminations
  physically vibrate at the carrier frequency -- the motor
  effectively becomes a small speaker emitting a tone at the
  PWM pitch.
* Far above ~50 kHz the MOSFETs and their gate drivers start
  losing efficiency to switching losses. During each on-off
  transition the MOSFET briefly carries both significant
  voltage and significant current, dissipating a small burst
  of power as heat; the MOSFETs' gate capacitance also has to
  be charged and discharged each cycle, which the driver chip
  pays for. Both costs scale with PWM frequency, so at high
  rates the heat from switching can rival the heat from
  conducting the motor current.

20 kHz is the comfortable default for hobby-size motors.

Driving an H-bridge
-------------------

A two-input H-bridge driver chip maps ``IN1`` and ``IN2`` to
the four switches roughly like this:

* ``IN1 = 0, IN2 = 0`` -- coast (all four switches open).
* ``IN1 = 1, IN2 = 0`` -- drive one direction.
* ``IN1 = 0, IN2 = 1`` -- drive the other direction.
* ``IN1 = 1, IN2 = 1`` -- brake.

Driving the two inputs as PWM outputs lets the camera set the
direction by choosing *which* of the two pins carries the duty,
and the speed by the duty value itself:

::

    import time
    from machine import PWM, Pin

    in1 = PWM(Pin("P7"), freq=20_000, duty_u16=0)
    in2 = PWM(Pin("P8"), freq=20_000, duty_u16=0)

    def drive_a(speed):       # speed: 0..65535
        in1.duty_u16(speed)
        in2.duty_u16(0)

    def drive_b(speed):
        in1.duty_u16(0)
        in2.duty_u16(speed)

    def coast():
        in1.duty_u16(0)
        in2.duty_u16(0)

    def brake():
        in1.duty_u16(65535)
        in2.duty_u16(65535)

    drive_a(32768)    # half speed in direction A
    time.sleep(2)
    drive_b(16384)    # quarter speed in direction B
    time.sleep(2)
    coast()

A ramp from off to full and back gives a smooth start and
stop:

::

    for d in range(0, 65535, 256):
        in1.duty_u16(d)
        time.sleep_ms(10)
    for d in range(65535, 0, -256):
        in1.duty_u16(d)
        time.sleep_ms(10)

Direction-and-speed drivers
---------------------------

A second family of H-bridge chips exposes a more convenient
interface: one digital *direction* input (often labelled
``DIR`` or ``PH`` for "phase") plus one *speed* input (often
``PWM`` or ``EN`` for "enable"). The direction pin picks which
way the bridge drives; the duty cycle on the speed pin sets
the average current.

This is easier to drive from software than the
two-PWM-input scheme. The two signals match how the problem is
usually phrased -- "turn this way, at this speed" -- so the
code can say ``set_direction(forward); set_speed(50)`` instead
of branching between ``in1`` and ``in2``. Only one PWM channel
is needed, which frees the other channel on the same timer for
an unrelated job. And the direction pin can stay parked between
changes without retriggering the bridge, so changing speed at a
fixed direction touches only one register.

::

    import time
    from machine import PWM, Pin

    dir_pin = Pin("P8", Pin.OUT)
    speed = PWM(Pin("P7"), freq=20_000, duty_u16=0)

    def drive(direction, speed_u16):
        dir_pin.value(direction)         # 0 or 1
        speed.duty_u16(speed_u16)        # 0..65535

    drive(0, 32768)     # direction A at half speed
    time.sleep(2)
    drive(1, 16384)     # direction B at quarter speed
    time.sleep(2)
    speed.duty_u16(0)   # stop

What "stop" actually does on this kind of driver -- coast or
brake -- depends on the chip. With a two-input driver the
camera's code chooses (both inputs low for coast, both high
for brake); with a direction-and-speed driver the chip decides,
so the data sheet is worth a glance before relying on either
behaviour.
