Filesystem hygiene
==================

Flash and SD storage on a shipped cam fill up with files no
operator is going to clean out by hand. Two decisions about
that storage stay with the product for its lifetime: *which
surface holds which kind of data*, and *how the directories
are structured so file operations keep working as the
application accumulates records*.

Where things go
---------------

Code and assets ride in the frozen modules and ROMFS the
build commits at ship time. Application *state* -- anything
the application writes at runtime, anything that grows,
anything that changes between boots -- has to live somewhere
else. The cam exposes two writable surfaces for it:

* **Internal flash** at ``/flash``: a small writable
  filesystem mounted before any application code runs. The
  right place for *small fixed-size records that survive
  reboots*: configuration the application updates at runtime,
  last-known calibration, a rolling counter, a one-line marker
  file saying "this cam was provisioned." Limited write cycles
  -- modern internal flash tolerates thousands to tens of
  thousands of writes per sector, not millions, so writes need
  to be infrequent, not per frame.

* **SD card** at ``/sdcard``: a larger writable filesystem
  mounted when a card is present. The right place for *bulky
  variable files*: image and video captures, log files, model
  fine-tuning data, anything that might grow to megabytes or
  gigabytes. Higher write capacity than internal flash but
  still finite; removable, replaceable, and the surface most
  likely to disappear when the application is mid-write.

The right answer for *where to write something* is almost
always "flash for small fixed records, SD for everything
else." The two are not interchangeable: an application that
scribbles its rolling log file to ``/flash`` will burn through
the flash's write endurance in a deployment that would have
been fine on SD.

Treat both as can-fail
----------------------

``/flash`` and ``/sdcard`` can both fail. The SD card can be
ejected, the flash can be corrupted by a power loss
mid-write, either can run out of space, and any operation on
either can raise :exc:`OSError` for reasons the application
will not get a chance to diagnose in the field.

Two patterns make the application survive that:

* **Wrap mounts and operations in try blocks.** Every
  :func:`open`, :func:`os.listdir`, :func:`os.rename` against
  user-data paths is potentially failing. Catch
  :exc:`OSError`, log it, and fall back to a defined
  alternative -- write to ``/flash`` if ``/sdcard`` is gone,
  skip the operation if neither is available.

* **Atomic writes for files that must survive a power loss.**
  Write to a temporary path, close the handle, then
  :func:`os.rename` over the live name. Either the rename
  succeeded and the file is the new version, or it did not
  and the file is the old version. There is no third state
  where the file is half-written::

    import os

    def write_config_atomic(path, contents):
        tmp = path + '.tmp'
        with open(tmp, 'w') as f:
            f.write(contents)
            f.flush()
        os.rename(tmp, path)

  The pattern works on both flash and SD. It does *not* work
  for files large enough that the tmp file uses up the
  filesystem's free space; reserve it for small records.

The slow-directory trap
-----------------------

The MicroPython VFS does not index directory contents the way
a desktop filesystem does. :func:`os.listdir` and
:func:`os.stat` walk the underlying file table linearly. A
directory with a hundred files is fine; a directory with ten
thousand files is unusably slow, with every :func:`os.listdir`
taking seconds and every :func:`open` checking against the
table on its way through.

Applications that write logs or captures to disk hit this
fastest. A naive ``/sdcard/logs/<timestamp>.log`` scheme that
opens one new file per minute fills the ``logs/`` directory
with half a million files in a year of deployment. Long
before then the application starts missing its frame rate
because every file open is taking longer than a frame
interval.

The right pattern is to split files across a tree of dated
subdirectories so no single directory ever holds more than a
few hundred entries::

    import os
    import time

    LOG_ROOT = '/sdcard/logs'

    def log_path(now=None):
        if now is None:
            now = time.localtime()
        year, month, day, hour = now[0], now[1], now[2], now[3]
        directory = '{}/{:04d}/{:02d}/{:02d}'.format(
            LOG_ROOT, year, month, day)
        _makedirs(directory)
        return '{}/{:02d}.log'.format(directory, hour)

    def _makedirs(path):
        # os.makedirs equivalent -- create each level if missing
        parts = path.split('/')
        for i in range(2, len(parts) + 1):
            sub = '/'.join(parts[:i])
            try:
                os.mkdir(sub)
            except OSError:
                pass

A year of one-file-per-hour logging is now spread across
365 day-directories, each containing at most 24 files;
:func:`os.listdir` against any one directory stays cheap, and
the application's frame loop does not stall on file
operations as the deployment ages.

The same principle applies to image captures, sensor traces,
or anything else the application writes a file per event for.
If the event rate is high, the tree wants to be deeper
(year/month/day/hour, or year/month/day/hour/minute) so each
leaf directory stays small. If the event rate is low, a
year/month tree is enough.

Per-device paths
----------------

In a fleet of more than one cam, log files need to identify
which physical unit they came from. :func:`machine.unique_id`
returns a hardware identifier baked into the cam at the
factory; it is the same value across reboots, across firmware
updates, and across SD card swaps. Embed it in the log path
or in the log records and an operator looking at a pile of
SD cards or a centralised log can tell which one is which::

    import binascii
    import machine

    UNIT_ID = binascii.hexlify(machine.unique_id()).decode()

    LOG_ROOT = '/sdcard/logs/' + UNIT_ID

Combined with the dated-subdirectory pattern, the layout
becomes ``/sdcard/logs/<unit-id>/2026/06/09/14.log`` -- one
unit's hour of records, in a directory shallow enough to
walk, on a path that names the unit on the file system
itself.

Pulling it together
-------------------

A shipped cam's writable storage looks roughly like this:

* ``/flash`` -- configuration, calibration, a provisioning
  marker. Written rarely, read often. Atomic-rename pattern
  for any file whose loss would break the next boot.

* ``/sdcard/logs/<unit-id>/<year>/<month>/<day>/<hour>.log``
  -- the operational log. Written continuously, rotated by
  the path, never written through a directory with thousands
  of siblings.

* ``/sdcard/captures/<unit-id>/<year>/<month>/<day>/``
  -- image or video captures the application makes. Same tree
  shape, same reason.

That layout costs the application about twenty lines of code
and saves it from the failure modes that take the cam down
months into a deployment.
