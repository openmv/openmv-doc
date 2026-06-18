Hardening for production
========================

A hardened application keeps running unattended on hardware
it cannot see. The pages in this section cover the runtime
discipline that turns a working application into one that
recovers from its own failures and leaves enough evidence
behind to diagnose them later.

Four pieces, ordered so each one supports the next. Logging
comes first because everything else writes to it. The
watchdog handles hangs and records what it caught into the
log. Filesystem hygiene keeps the log writes fast as the
application accumulates records over months or years in the
field. The security page closes with what flash readout
protection covers and what the work to enable it actually
looks like -- relevant when the application code's privacy
is a product requirement.

The first three apply to every shipped cam. A missing
watchdog is a hang nobody can recover from; missing logging
is a crash that left no field evidence; missing filesystem
hygiene is a flat directory of log files that took the frame
rate down with it.

The fourth, readout protection, is situational. Many shipped
cams sit in places where physical access is already
controlled -- factories, fixed installations, secured
operator stations, behind locked enclosures -- and the
engineering cost of locking the firmware down is unjustified
for those deployments. The page covers what the cost looks
like when it *is* justified.

.. toctree::
   :maxdepth: 1

   logging
   watchdog
   filesystem
   security
