.. currentmodule:: rp2
.. _rp2.PIO:

class PIO -- advanced PIO usage
===============================

The :class:`PIO` class wraps one of the RP2040's two Programmable
I/O (PIO) blocks. Each PIO block contains an instruction memory
(32 instructions) shared by four independent state machines, plus a
private FIFO interface to each state machine and an IRQ controller.

Most scripts interact with PIO through :class:`StateMachine` --
this class is for advanced use cases that need to:

   * Load and remove programs explicitly via :meth:`add_program` /
     :meth:`remove_program`.
   * Move the PIO's GPIO base across the chip's 32-pin window via
     :meth:`gpio_base`.
   * Hook into block-wide IRQ flags via :meth:`irq`.

For assembling PIO programs see :func:`rp2.asm_pio`.

Constructors
------------

.. class:: PIO(id: int)

   Return the singleton :class:`PIO` object for the PIO block
   identified by ``id``. The RP2040 has two PIO blocks, numbered
   ``0`` and ``1``. Raises ``ValueError`` for any other id.

   Methods
   -------

   .. method:: gpio_base(base: machine.Pin | int | None = None, /) -> int

      Get or set the GPIO base for this PIO block.

      The RP2040 PIO sees a 32-pin window into the GPIO space; the
      window can start at GPIO0 or GPIO16. The base controls which
      window is in effect for all state machines on this PIO.

      With no argument, return the current base (the GPIO pin
      number, ``0`` or ``16``).

      With an argument, set the base. ``base`` may be a
      :class:`machine.Pin` instance or the integer pin number, and
      must resolve to GPIO0 or GPIO16. The base must be set
      *before* any program is added or state machine constructed
      on this PIO block.

   .. method:: add_program(program: Callable) -> None

      Load ``program`` into this PIO's instruction memory. The
      resulting memory layout is reused across all state machines
      on this PIO block.

      Each PIO has only 32 instructions of program memory shared
      across all programs; if the new program doesn't fit, this
      method raises ``OSError(ENOMEM)``. The same program can be
      loaded onto both PIO instances, but they consume separate
      memory regions.

   .. method:: remove_program(program: Callable | None = None, /) -> None

      Remove ``program`` from this PIO's instruction memory,
      freeing up space for new programs. If ``program`` is
      omitted, every program currently loaded on this PIO is
      removed.

      Removing a program that wasn't loaded is a no-op (no
      exception).

   .. method:: state_machine(id: int, program: Callable | None = None, *args, **kwargs) -> StateMachine

      Return one of the four :class:`StateMachine` instances owned
      by this PIO block. ``id`` is the local state-machine index
      (``0`` -- ``3``).

      If ``program`` is provided, the state machine is configured
      to run it -- all positional/keyword arguments are forwarded
      to :meth:`StateMachine.init`.

      Example::

          >>> rp2.PIO(1).state_machine(3)
          StateMachine(7)

      The returned object's global state-machine ID is
      ``pio_id * 4 + sm_id``.

   .. method:: irq(handler: Callable[[PIO], None] | None = None, trigger: int = IRQ_SM0 | IRQ_SM1 | IRQ_SM2 | IRQ_SM3, hard: bool = False) -> Callable

      Get or configure the block-level IRQ for this PIO.

      ``handler`` is the callback to fire when any of the
      requested state-machine IRQs latch. The handler receives
      this :class:`PIO` instance as its only argument; inside the
      handler the firing state machines can be identified via
      ``self.irq().flags()`` AND'd against the :data:`IRQ_SM*`
      constants.

      ``trigger`` is a bitmask of one or more :data:`IRQ_SM0` ..
      :data:`IRQ_SM3`. The default fires on any state machine.

      ``hard=True`` registers a hard-interrupt handler (no heap
      allocation in the callback).

      MicroPython binds IRQ 0 on each PIO block; IRQ 1 is reserved
      and not accessible from Python.

   Constants
   ---------

   .. data:: IN_LOW
      :type: int

      Pass to ``out_init`` / ``set_init`` / ``sideset_init`` of
      :func:`asm_pio` so the pin starts as an input driven low
      (i.e. tristate with the output buffer holding a 0).

   .. data:: IN_HIGH
      :type: int

      Pass to ``out_init`` / ``set_init`` / ``sideset_init`` of
      :func:`asm_pio` so the pin starts as an input with the
      output buffer holding a 1.

   .. data:: OUT_LOW
      :type: int

      Pass to ``out_init`` / ``set_init`` / ``sideset_init`` of
      :func:`asm_pio` so the pin starts as a driven output at
      logic 0.

   .. data:: OUT_HIGH
      :type: int

      Pass to ``out_init`` / ``set_init`` / ``sideset_init`` of
      :func:`asm_pio` so the pin starts as a driven output at
      logic 1.

   .. data:: SHIFT_LEFT
      :type: int

      Pass to ``in_shiftdir`` / ``out_shiftdir`` of :func:`asm_pio`
      or :meth:`StateMachine.init` so shifts move bits towards the
      MSB.

   .. data:: SHIFT_RIGHT
      :type: int

      Pass to ``in_shiftdir`` / ``out_shiftdir`` of :func:`asm_pio`
      or :meth:`StateMachine.init` so shifts move bits towards the
      LSB.

   .. data:: JOIN_NONE
      :type: int

      Pass to ``fifo_join`` of :func:`asm_pio` so the state
      machine has separate 4-word TX and RX FIFOs (the default).

   .. data:: JOIN_TX
      :type: int

      Pass to ``fifo_join`` of :func:`asm_pio` so the TX FIFO is
      doubled to 8 words by absorbing the RX FIFO. The state
      machine can no longer receive data.

   .. data:: JOIN_RX
      :type: int

      Pass to ``fifo_join`` of :func:`asm_pio` so the RX FIFO is
      doubled to 8 words by absorbing the TX FIFO. The state
      machine can no longer transmit data.

   .. data:: IRQ_SM0
      :type: int

      :meth:`irq` ``trigger`` flag: state machine 0 raised its IRQ.

   .. data:: IRQ_SM1
      :type: int

      :meth:`irq` ``trigger`` flag: state machine 1 raised its IRQ.

   .. data:: IRQ_SM2
      :type: int

      :meth:`irq` ``trigger`` flag: state machine 2 raised its IRQ.

   .. data:: IRQ_SM3
      :type: int

      :meth:`irq` ``trigger`` flag: state machine 3 raised its IRQ.
