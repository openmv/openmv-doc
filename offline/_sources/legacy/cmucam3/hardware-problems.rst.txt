Hardware Problems
=================

This page lists known hardware issues. Pay special attention to avoid damaging
devices.

**External Servo Jumper: Do not install it as shown in v1.00 of the CMUcam
Datasheet**

-- If a jumper is placed on the lower two pins of the power selection jumper,
this connects the external power directly to the board power after the switch.
If two supplies are connected, one could be damaged. The solution is to simply
disconnect all jumpers if you wish to use external power. This has been updated
in all documentation (datasheet v1.01+ as well as wiki). Internal servo power
usage remains the same.

**Incorrect TTL Serial Pinout in CMUcam3 datasheet**

-- Pin ordering and voltage was incorrect on page 6 of CMUcam3 datasheet. Fixed
in version 1.02 of datasheet as well as online wiki documentation.
