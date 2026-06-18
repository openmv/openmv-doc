A note on flash readout protection
==================================

Out of the box, the firmware on a shipped OpenMV cam is
*readable* by anyone with physical access to the device. An
attacker with the cam in hand can attach an SWD probe to the
debug header, talk to the MCU's debug interface, and dump the
flash -- which includes every frozen Python module and the
contents of the ROMFS partition. The stock OpenMV firmware
does **not** enable flash readout protection by default.

This page documents that explicitly so a team shipping a
product knows where the responsibility lies.

What the cam does by default
----------------------------

The cam's bootloader and runtime do not turn on any
readout-protection feature of the underlying MCU. The debug
interface stays open, the flash stays readable, and the build
runs the way it does on a developer's bench. That is the
right default for the tutorial audience -- a cam that ships
with readout protection on is a cam that cannot be reflashed
through the IDE, cannot be re-imaged after a botched
deployment, and cannot be salvaged by anyone but the build
team.

The trade-off changes when the cam goes from "developer
device" to "product." A product whose value depends on the
application code staying private has to enable the protection
itself; the OpenMV firmware does not do it.

What the product team does
--------------------------

Every MCU vendor offers a readout-protection mechanism. The
details differ -- bit-level fuses, one-shot lifecycle
transitions, signed flash images -- but the common shape is:

* A vendor-specific bit (or set of bits) is committed to the
  silicon, usually through a vendor tool that talks to the
  MCU's debug port one last time.
* After the commit, the debug port refuses to read flash. The
  cam still boots and runs the application; it just no longer
  exposes its contents to a probe.
* The commit is *irreversible*. There is no way to bring the
  cam back to a debuggable state without destroying it.

Setting this up is MCU-specific, and the steps depend on the
part on the cam being protected. The vendor's reference
manual is the source of truth; vendor support is the channel
for getting it right on a manufacturing line.

This is the easy part.

The hard part is closing every *other* path an attacker has
to running code on the cam or reading what the application is
doing. Readout protection only stops a debug probe from
dumping flash. The cam still has to close:

* **The MicroPython REPL.** A USB-attached REPL accepts
  arbitrary Python. Readout protection does not change that.
  A REPL session can read RAM, call functions, exfiltrate
  whatever the running application can see -- in effect, a
  reachable REPL bypasses everything the readout protection
  buys. Disabling REPL access is a firmware-build change the
  product team owns.

* **IDE script upload.** The IDE's "run this script on the
  cam" path rides the same USB protocol surface the REPL
  does. Closing the REPL closes this with it; leaving either
  open leaves an arbitrary-code-execution channel into the
  cam.

* **Hijacking the entry point from the filesystem.** Already
  closed when the application is shipped through
  :doc:`/openmvcam/tutorial/production/shipping/freezing-scripts`
  -- the runtime resolves frozen ``boot.py`` and ``main.py``
  before any filesystem copy, so nothing dropped on flash or
  SD can override them. This protection is free once the
  application is in the build.

* **External flash on newer cams.** Cams that store the
  application image in external flash put that image on a
  chip sitting in plain sight on the PCB; the chip can be
  desoldered and read directly with off-the-shelf tools, or
  read in place by probing the bus. Protecting it requires
  turning on the on-chip hardware that decrypts the flash
  contents during reads, generating the encryption key,
  provisioning that key onto the cam, and burning it
  irreversibly into the MCU's one-time-programmable storage.
  Each of those is a separate one-shot operation, and any
  one of them done wrong on a production unit bricks that
  unit.

Each item on this list is its own stack of firmware-build
work, manufacturing-line steps, and irreversible commits. A
real locked-down product is a customised firmware build, a
customised bootloader, a manufacturing flow that provisions
keys per unit, and a set of tests that prove the lock is
actually closed before the unit leaves the line. That is
months of work, not days, and the irreversibility means
mistakes cost units.

.. admonition:: Why the default is open

   This list is also why the stock OpenMV firmware ships
   *without* readout protection enabled. A cam with the
   REPL closed, IDE script upload disabled, and the firmware
   locked is a cam that cannot be developed on at all -- the
   workflow that makes OpenMV cams usable in the first place
   would just be gone. The default leaves everything open;
   the product team chooses which pieces to close on the way
   to a shipped unit.

What physical access still buys
-------------------------------

Even with readout protection on, an attacker who holds the
cam can do quite a lot:

* Replay the cam's network traffic by sniffing its outputs.
* Observe its visible behaviour and infer how it reacts to
  inputs.
* In some cases, recover secrets through fault-injection or
  side-channel attacks specialised against the protected
  MCU.

Readout protection raises the cost of getting at the
application's source. It does not eliminate the cost.
"Physical access = compromise" is the working assumption a
security review should start from; the protection mechanism
just decides how much that compromise costs in time and
equipment.

What the OpenMV firmware ships with
-----------------------------------

A summary, so this is concrete:

* No readout protection enabled by default.
* No build flag in the stock firmware that turns it on.
* No application-level API to call from MicroPython.

A product that needs the protection ships customised
firmware. That customisation lives in the board's bootloader
and the manufacturing flow, and is outside the OpenMV
codebase. Teams doing this for the first time should plan it
into the development timeline as a discrete piece of work, not
as something to add at the end -- the irreversibility makes
"add it later" expensive.
