:mod:`espflash` --- ESP32 ROM bootloader firmware flasher
=========================================================

.. module:: espflash
   :synopsis: ESP32 ROM bootloader firmware flasher

This module provides a minimal :py:class:`~espflash.ESPFlash` implementation that
communicates with the ESP32 ROM bootloader over a UART. It is intended for
in-system updates of the ESP32 firmware on companion modules (for example, the
U-blox NINA-W10 module used on Arduino boards), and is not a replacement for the
full ``esptool`` utility. Advanced features (stub loader, other ESP chips,
deflate, secure boot, etc.) are intentionally not supported.

The driver toggles ``RESET`` and ``GPIO0`` to put the ESP32 into download mode,
then issues SLIP-framed commands to read the flash size, configure the SPI
interface, write the firmware image and verify it via an MD5 digest.

Example::

    from machine import Pin, UART
    from espflash import ESPFlash

    reset = Pin("ESP_RESET", Pin.OUT)
    gpio0 = Pin("ESP_GPIO0", Pin.OUT)
    uart = UART(1, 115200, timeout=1000)

    esp = ESPFlash(reset, gpio0, uart)
    esp.bootloader()
    esp.set_baudrate(921600)
    size = esp.flash_read_size()
    esp.flash_attach()
    esp.flash_config(size)
    esp.flash_write_file("NINA_FW.bin")
    esp.flash_verify_file("NINA_FW.bin")
    esp.reboot()

class ESPFlash
--------------

.. class:: ESPFlash(reset: "machine.Pin", gpio0: "machine.Pin", uart: "machine.UART", log_enabled: bool = False)

    Construct an ``ESPFlash`` object that drives the ESP32 ROM bootloader.

        - *reset* is a :py:class:`machine.Pin` instance connected to the ESP32 ``RESET`` line, configured as an output.
        - *gpio0* is a :py:class:`machine.Pin` instance connected to the ESP32 ``GPIO0`` line, configured as an output.
        - *uart* is a :py:class:`machine.UART` instance connected to the ESP32 ``UART0`` pins. It must be initialised at 115200 baud with a non-zero read timeout.
        - *log_enabled* enables verbose logging of the SLIP frames exchanged with the bootloader. Useful for debugging only.

    The constructor will attempt to import :mod:`hashlib`. If ``hashlib.md5`` is
    available, the running MD5 digest used by `ESPFlash.flash_verify_file()`
    will be computed automatically while writing.

    .. method:: set_baudrate(baudrate: int, timeout: int = 350) -> None

        Change the bootloader UART baudrate.

            - *baudrate* is the new baudrate to switch to. If different from the
              currently active baudrate, a ``CHANGE_BAUDRATE`` command is issued
              to the bootloader before the local UART is reconfigured.
            - *timeout* is reserved and currently unused.

        Has no effect if the underlying UART object does not implement an
        ``init()`` method.

    .. method:: bootloader(retry: int = 6) -> bool

        Drive ``RESET`` and ``GPIO0`` to enter the ESP32 ROM download mode and
        synchronise with the bootloader.

            - *retry* is the number of reset/sync attempts before giving up.

        Returns ``True`` on success, otherwise raises an ``Exception``.

    .. method:: flash_read_size() -> int

        Read the SPI flash JEDEC ID and return the flash size in bytes.

        Raises an ``Exception`` if the reported size bits are out of the
        expected ``0x12``-``0x19`` range.

    .. method:: flash_attach() -> None

        Attach to the SPI flash. Must be called once after `bootloader()` and
        before any flash read/write operation.

    .. method:: flash_config(flash_size: int = 2 * 1024 * 1024) -> None

        Configure the SPI flash parameters.

            - *flash_size* is the total flash size in bytes, typically the value
              returned by `flash_read_size()`.

        Block, sector and page sizes are fixed at 64 KiB, 4 KiB and 256 bytes
        respectively.

    .. method:: flash_write_file(path: str, blksize: int = 0x1000) -> None

        Write a firmware image to flash starting at offset 0.

            - *path* is the filesystem path of the firmware binary to flash.
            - *blksize* is the size in bytes of each data block sent to the
              bootloader. Must be a multiple of the sector size.

        The last block is padded with ``0xFF`` to a full *blksize*. If MD5
        support is available, the running MD5 digest is updated during the
        write so that `flash_verify_file()` can be called without arguments.

    .. method:: flash_verify_file(path: str, digest: bytes | None = None, offset: int = 0) -> None

        Verify the contents of flash against a firmware file.

            - *path* is the filesystem path of the reference firmware binary;
              its size determines the number of bytes to verify.
            - *digest* is an optional pre-computed hex-encoded MD5 digest of
              the file. If ``None``, the digest computed during the most recent
              `flash_write_file()` call is used.
            - *offset* is the flash offset in bytes at which verification
              starts.

        Raises an ``Exception`` if no digest is available or if the flash
        contents do not match the reference digest.

    .. method:: reboot() -> None

        Send a ``FLASH_END`` command that instructs the ROM bootloader to
        reboot the ESP32 and run the freshly flashed firmware. No response is
        read.
