.. currentmodule:: machine
.. _machine.SDCard:

class SDCard -- SD / MMC card driver
====================================

The :class:`SDCard` class drives the SD / MMC card slot on OpenMV
cams that have one. The driver implements the
:class:`vfs.AbstractBlockDev` interface so it can be passed directly
to :func:`vfs.mount`::

    import machine
    import vfs

    sd = machine.SDCard()
    vfs.mount(sd, "/sd")

.. note::

   OpenMV firmware auto-mounts the SD card at boot, so most scripts
   never construct an :class:`SDCard` directly -- they just read and
   write through the auto-mounted path. Construct one manually only
   when you need a non-default mount point or raw block-level access
   through :meth:`readblocks` / :meth:`writeblocks` / :meth:`ioctl`.

On the OpenMV Cam M7 / H7 / H7 Plus / Pure Thermal / N6 the slot is
driven by the STM32's on-chip SDMMC controller in 4-bit SD mode. On
the OpenMV Cam RT1062 the slot is driven by the i.MX RT's USDHC
controller, also in 4-bit SD mode. No pin-mux arguments are needed
on any current OpenMV board -- the driver knows the board's wiring.

Not exposed on the OpenMV Cam AE3 (alif port).

Constructors
------------

.. class:: SDCard(id: int = 1) -> SDCard

   Return the :class:`SDCard` singleton for the SD slot identified
   by ``id``. ``id`` is accepted for cross-port compatibility but
   the OpenMV-supported ports only expose one slot; pass ``1`` or
   omit it.

   On STM32 the constructor takes no arguments at all; on mimxrt the
   ``id`` argument is accepted but only ``1`` is valid.

   Methods
   -------

   .. method:: present() -> bool

      Return ``True`` if a card is currently detected in the slot,
      ``False`` otherwise.

      On boards that wire a card-detect signal the method reflects
      that signal in real time, so it can be polled after the
      :class:`SDCard` object has been constructed to react to hot
      insertion / removal. On boards without a card-detect signal
      the value is latched at construction time -- it reports the
      result of the initial CMD0 probe the driver did when the
      object was created, and a card hot-inserted afterwards will
      not be visible until the object is re-constructed (or
      :meth:`init` is called on mimxrt).

   .. method:: info() -> tuple[int, int, int]

      Return a 3-tuple describing the currently-inserted card:

         * ``[0]`` ``num_blocks`` -- total capacity in 512-byte
           blocks. Multiply by 512 to get the raw byte capacity.
         * ``[1]`` ``block_size`` -- always ``512`` for SD cards.
           Included so callers can do
           ``num_blocks * block_size`` portably.
         * ``[2]`` ``card_type`` -- the card type reported by the
           SD bus during the CMD8 / OCR initialisation handshake.
           Typical values are ``0`` (SDSC -- standard capacity),
           ``0x40`` (SDHC / SDXC -- high / extended capacity) and
           ``0x80`` (MMC).

      Useful for sanity-checking that the card was recognised, or
      to display free-space figures relative to total capacity.

   .. method:: power(state: bool, /) -> None

      Turn the card slot's power rail on or off. STM32 firmware
      exposes the method but no current OpenMV Cam gates the SD
      power supply, so the call is effectively a no-op. Kept for
      compatibility with code originally written for the upstream
      MicroPython STM32 reference boards. STM32 port only.

   .. method:: read(block_num: int, /) -> bytes

      Read a single 512-byte block from the card and return it as a
      newly-allocated ``bytes`` object.

      This is the legacy single-block read shipped by the STM32
      port. New code should use :meth:`readblocks` instead -- that
      method works on every OpenMV port, can read any number of
      contiguous blocks in one transfer, and avoids the per-call
      allocation by writing into a caller-supplied buffer. STM32
      port only.

   .. method:: write(block_num: int, data: bytes, /) -> None

      Write a single 512-byte block to the card. ``data`` must be
      exactly 512 bytes long.

      This is the legacy single-block write shipped by the STM32
      port; new code should use :meth:`writeblocks` instead, which
      works on every OpenMV port and can write any number of
      contiguous blocks per call. STM32 port only.

   .. method:: readblocks(block_num: int, buf: bytearray) -> None
               readblocks(block_num: int, buf: bytearray, offset: int) -> None

      Read raw block-aligned data from the card into ``buf``.
      Standard :class:`vfs.AbstractBlockDev` block-device entry
      point used by the filesystem layer.

      **Simple form** (``readblocks(block_num, buf)``): read whole
      blocks starting at block index ``block_num``. ``len(buf)``
      must be a multiple of the SD block size (512 bytes).

      **Extended form** (``readblocks(block_num, buf, offset)``):
      read ``len(buf)`` bytes -- not necessarily a whole number of
      blocks -- starting at byte ``offset`` within block
      ``block_num``. Used by littlefs and other byte-addressable
      filesystems.

   .. method:: writeblocks(block_num: int, buf: bytes | bytearray) -> None
               writeblocks(block_num: int, buf: bytes | bytearray, offset: int) -> None

      Write raw block-aligned data from ``buf`` to the card.
      Standard :class:`vfs.AbstractBlockDev` block-device entry
      point used by the filesystem layer.

      **Simple form** (``writeblocks(block_num, buf)``): write
      whole blocks starting at block index ``block_num``.
      ``len(buf)`` must be a multiple of the SD block size (512
      bytes). Each affected block is overwritten in full.

      **Extended form** (``writeblocks(block_num, buf, offset)``):
      write ``len(buf)`` bytes -- not necessarily a whole number
      of blocks -- starting at byte ``offset`` within block
      ``block_num``. Used by littlefs and other byte-addressable
      filesystems.

   .. method:: ioctl(cmd: int, arg: int) -> int | None

      Standard :class:`vfs.AbstractBlockDev` control entry point.
      Called by the filesystem layer at mount/unmount time and on
      every sync. The recognised ``cmd`` values are:

         * ``1`` -- initialise. Return ``0`` on success.
         * ``2`` -- deinitialise. Return ``0`` on success.
         * ``3`` -- sync any pending writes. Returns ``0`` (the
           SDMMC driver writes synchronously, nothing to flush).
         * ``4`` -- return the number of blocks on the device.
         * ``5`` -- return the size of a single block (always
           512).
         * ``6`` -- erase a block (no-op on SD, kept for the
           :class:`vfs.AbstractBlockDev` contract).
         * ``7`` -- return whether the device supports block
           erase (0 on SD).

      Direct callers normally don't use this method -- the
      filesystem driver dispatches all the standard codes
      automatically once the :class:`SDCard` is mounted.

   .. method:: init(*args, **kwargs) -> None

      Re-initialise the SD interface from scratch. Accepts the same
      arguments as the constructor. Useful for re-detecting a
      hot-inserted card on boards without a card-detect signal,
      since :meth:`present` is otherwise latched at construction
      time. mimxrt port only.

   .. method:: deinit() -> None

      De-initialise the SD interface, releasing the SDMMC/USDHC
      controller and the IO pins it claimed. The :class:`SDCard`
      object becomes unusable until :meth:`init` is called again.
      Use it before re-flashing the card from another interface,
      or to drop power to the slot in a battery-powered
      application. mimxrt port only.
