Software Problems
=================

This page lists known software problems that we have fixed since the v1.0
release of the CC3 source.

**Security-Cam: Saved images consist of horizontal colored lines**

* This is a problem due to not changing the camera configurations before the
  jpeg image is taken. This was fixed in r503. Please update SVN to get the
  latest source or go to the :doc:`security-cam` page.

**MMC Write Failures**

* Some MMC cards are very slow and would return errors due to a small timeout.
  In r507 we increased the timeout allowing the cards to function, however they
  can be quite slow. In some of the worst cases, it can take as long as 40
  seconds to save a ppm image. Make sure to check the :doc:`MMC <mmc>` page for
  a list of tested cards.

**MMC File Number Limit**

* r513 fixes a bug that stopped the FAT driver from expanding the size of
  directory tables. This would limit the number of files to 254 in a
  subdirectory where as FAT should support 65K files. This has been fixed in
  later releases. Note, the root directory in FAT can only hold 255 files or
  directories under normal operation.

**Viola-Jones Compile Problems**

* r525 fixes the compile problems in the viola-jones project. Before the fix, it
  was using older cc3 api names that are no longer supported.

**cc3_track_color() bug**

* minor fix to cc3_track_color(cc3_track_pkt_t * pkt) function in
  cc3_color_track.c fixed in r529.

**cc3_track_color() t_pkt setup issue**

* t_pkt.track_invert is not false by default, so track color will return the
  inverted color space.
* call t_pkt.track_invert=false; before calling simple_track_color();
* example files updated in r559 (spoonBot and simple_track_color)
