.. currentmodule:: stm

:mod:`stm` --- functionality specific to STM32 MCUs
===================================================

.. module:: stm
    :synopsis: functionality specific to STM32 MCUs

This module provides functionality specific to STM32 microcontrollers, including
direct access to peripheral registers.

Memory access
-------------

The module exposes three subscriptable objects used for raw memory access.
Each behaves like a sparse array indexed by byte address: ``value = memN[addr]``
reads, ``memN[addr] = value`` writes. The address is always a byte address,
regardless of the access width.

These memory objects can be used in combination with the peripheral register
constants below to read and write MCU hardware peripheral registers, as well
as any other location in the SoC's address space.

.. data:: mem8

   Subscriptable 8-bit memory accessor. ``mem8[addr]`` reads an ``int`` in the
   range 0-255 from the byte at ``addr``; ``mem8[addr] = value`` writes the
   low 8 bits of ``value``. ``addr`` may be any byte-aligned address.

.. data:: mem16

   Subscriptable 16-bit (halfword) memory accessor. ``mem16[addr]`` reads an
   ``int`` in the range 0-65535; ``mem16[addr] = value`` writes the low 16
   bits. ``addr`` must be aligned to 2 bytes.

.. data:: mem32

   Subscriptable 32-bit (word) memory accessor. ``mem32[addr]`` reads an
   ``int`` in the range 0-0xFFFFFFFF; ``mem32[addr] = value`` writes the low
   32 bits. ``addr`` must be aligned to 4 bytes.


Peripheral register constants
-----------------------------

The module defines constants for registers which are generated from CMSIS header
files, and the constants available depend on the microcontroller series that is
being compiled for.  Examples of some constants include:

.. data:: GPIOA
   :type: int

    Base address of the GPIOA peripheral.

.. data:: GPIOB
   :type: int

    Base address of the GPIOB peripheral.

.. data:: GPIO_BSRR
   :type: int

    Offset of the GPIO bit set/reset register.

.. data:: GPIO_IDR
   :type: int

    Offset of the GPIO input data register.

.. data:: GPIO_ODR
   :type: int

    Offset of the GPIO output data register.

Constants that are named after a peripheral, like ``GPIOA``, are the absolute
address of that peripheral.  Constants that have a prefix which is the name of a
peripheral, like ``GPIO_BSRR``, are relative offsets of the register.  Accessing
peripheral registers requires adding the absolute base address of the peripheral
and the relative register offset.  For example ``GPIOA + GPIO_BSRR`` is the
full, absolute address of the ``GPIOA->BSRR`` register.

Example use:

.. code-block:: python3

    # set PA2 high
    stm.mem32[stm.GPIOA + stm.GPIO_BSRR] = 1 << 2

    # read PA3
    value = (stm.mem32[stm.GPIOA + stm.GPIO_IDR] >> 3) & 1


