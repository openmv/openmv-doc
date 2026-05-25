.. currentmodule:: machine
.. _machine.I2CTarget:

class I2CTarget -- an I2C target device
=======================================

An I2C target is a device which connects to an I2C bus and is controlled by an
I2C controller.  I2C targets can take many forms.  The :class:`machine.I2CTarget`
class implements an I2C target that can be configured as a memory/register device,
or as an arbitrary I2C device by using callbacks (if supported by the port).

Available on the OpenMV Cam M4 / M7 / H7 / H7 Plus / Pure Thermal /
RT1062 / AE3.

Example usage for the case of a memory device::

    from machine import I2CTarget

    # Create the backing memory for the I2C target.
    mem = bytearray(8)

    # Create an I2C target.  Depending on the port, extra parameters
    # may be required to select the peripheral and/or pins to use.
    i2c = I2CTarget(addr=67, mem=mem)

    # At this point an I2C controller can read and write `mem`.
    ...

    # Deinitialise the I2C target.
    i2c.deinit()

Note that some ports require an ``id``, and maybe ``scl`` and ``sda`` pins, to be
passed to the `I2CTarget` constructor, to select the hardware I2C instance and
pins that it connects to.

When configured as a memory device, it's also possible to register to receive events.
For example to be notified when the memory is read/written::

    from machine import I2CTarget

    # Define an IRQ handler, for I2C events.
    def irq_handler(i2c_target):
        flags = i2c_target.irq().flags()
        if flags & I2CTarget.IRQ_END_READ:
            print("controller read target at addr", i2c_target.memaddr)
        if flags & I2CTarget.IRQ_END_WRITE:
            print("controller wrote target at addr", i2c_target.memaddr)

    # Create the I2C target and register to receive default events.
    mem = bytearray(8)
    i2c = I2CTarget(addr=67, mem=mem)
    i2c.irq(irq_handler)

More complicated I2C devices can be implemented using the full set of events.  For
example, to see the raw events as they are triggered::

    from machine import I2CTarget

    # Define an IRQ handler that prints the event id and responds to reads/writes.
    def irq_handler(i2c_target, buf=bytearray(1)):
        flags = i2c_target.irq().flags()
        print(flags)
        if flags & I2CTarget.IRQ_READ_REQ:
            i2c_target.write(buf)
        if flags & I2CTarget.IRQ_WRITE_REQ:
            i2c_target.readinto(buf)

    # Create the I2C target and register to receive all events.
    i2c = I2CTarget(addr=67)
    all_triggers = (
        I2CTarget.IRQ_ADDR_MATCH_READ
        | I2CTarget.IRQ_ADDR_MATCH_WRITE
        | I2CTarget.IRQ_READ_REQ
        | I2CTarget.IRQ_WRITE_REQ
        | I2CTarget.IRQ_END_READ
        | I2CTarget.IRQ_END_WRITE
    )
    i2c.irq(irq_handler, trigger=all_triggers, hard=True)

Constructors
------------

.. class:: I2CTarget(id: int, addr: int, *, addrsize: int = 7, mem: bytearray | None = None, mem_addrsize: int = 8, scl: Pin | None = None, sda: Pin | None = None)

   Construct and return a new I2CTarget object using the following parameters:

      - *id* identifies a particular I2C peripheral.  Allowed values depend on the
        particular port/board.  Some ports have a default in which case this parameter
        can be omitted.
      - *addr* is the I2C address of the target.
      - *addrsize* is the number of bits in the I2C target address.  Valid values
        are 7 and 10.
      - *mem* is an object with the buffer protocol that is writable.  If not
        specified then there is no backing memory and data must be read/written
        using the :meth:`I2CTarget.readinto` and :meth:`I2CTarget.write` methods.
      - *mem_addrsize* is the number of bits in the memory address.  Valid values
        are 0, 8, 16, 24 and 32.
      - *scl* is a pin object specifying the pin to use for SCL.
      - *sda* is a pin object specifying the pin to use for SDA.

   Note that some ports/boards will have default values of *scl* and *sda*
   that can be changed in this constructor.  Others will have fixed values
   of *scl* and *sda* that cannot be changed.

   General Methods
   ---------------

   .. method:: deinit() -> None

      Deinitialise the I2C target.  After this method is called the hardware will no
      longer respond to requests on the I2C bus, and no other methods can be called.

   .. method:: readinto(buf: bytearray) -> int

      Read into the given buffer any pending bytes written by the I2C controller.
      Returns the number of bytes read.

   .. method:: write(buf: bytes) -> int

      Write out the bytes from the given buffer, to be passed to the I2C controller
      after it sends a read request.  Returns the number of bytes written.  Most ports
      only accept one byte at a time to this method.

   .. method:: irq(handler: Callable[[I2CTarget], None] | None = None, trigger: int = IRQ_END_READ | IRQ_END_WRITE, hard: bool = False) -> None

      Install an IRQ ``handler`` that is invoked when one of the
      events selected by ``trigger`` fires. ``trigger`` is a bitmask
      of :data:`IRQ_*` constants OR'd together; the default fires on
      the end of every controller-side read or write.

      ``hard=True`` registers a hard-interrupt handler (no heap
      allocation in the callback). The default is a scheduled
      callback. Pass ``handler=None`` to disable the interrupt.

      .. note::

         :data:`IRQ_ADDR_MATCH_READ`, :data:`IRQ_ADDR_MATCH_WRITE`,
         :data:`IRQ_READ_REQ` and :data:`IRQ_WRITE_REQ` must be
         handled by a hard IRQ callback (``hard=True``) because the
         events have to be acknowledged synchronously with the
         hardware. :data:`IRQ_END_READ` and :data:`IRQ_END_WRITE`
         may be handled by either soft or hard callbacks; all
         events share a single handler, so if any event needs a
         hard callback they all do.

         When a memory buffer is supplied to the constructor the
         driver suppresses :data:`IRQ_END_WRITE` for the transaction
         that just writes the memory address. This keeps the
         end-of-transaction events meaningful even when the soft-IRQ
         scheduler defers the callback.

   .. attribute:: memaddr

      The integer value of the most recent memory address that was selected by the I2C
      controller (only valid if ``mem`` was specified in the constructor).

   Constants
   ---------

   Each :data:`IRQ_*` constant is a flag bit. OR them together to
   build a ``trigger`` mask for :meth:`irq`. Inside the handler the
   set of fired events can be recovered via ``self.irq().flags()``
   AND'd with each constant.

   .. data:: IRQ_ADDR_MATCH_READ
      :type: int

      Fires when a controller addresses this target for a read
      transaction (the address byte has been received with the
      read/write bit set to ``1``). Hard-IRQ only.

   .. data:: IRQ_ADDR_MATCH_WRITE
      :type: int

      Fires when a controller addresses this target for a write
      transaction (the address byte has been received with the
      read/write bit set to ``0``). Hard-IRQ only.

   .. data:: IRQ_READ_REQ
      :type: int

      Fires when the controller is requesting a byte from the
      target. The handler must call :meth:`write` to supply the
      byte before the controller's clock cycle completes.
      Hard-IRQ only.

   .. data:: IRQ_WRITE_REQ
      :type: int

      Fires when the controller has clocked in a byte to the
      target. The handler must call :meth:`readinto` to retrieve
      the byte before the controller sends the next one.
      Hard-IRQ only.

   .. data:: IRQ_END_READ
      :type: int

      Fires when the controller has finished a read transaction
      (received STOP / repeated START). May be handled by either a
      hard or soft IRQ callback.

   .. data:: IRQ_END_WRITE
      :type: int

      Fires when the controller has finished a write transaction
      (received STOP / repeated START). May be handled by either a
      hard or soft IRQ callback. Suppressed for the transaction
      that writes the memory address when a ``mem`` buffer was
      supplied to the constructor.
