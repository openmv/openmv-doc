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

The :mod:`stm` module exposes the full set of CMSIS register addresses and
offsets for whichever STM32 family the firmware was compiled for. The names
mirror ST's CMSIS headers exactly: ``STM32F427xx``, ``STM32F765xx``,
``STM32H743xx`` and ``STM32N657xx`` on the M4, M7, H7 family (H7 / H7 Plus
/ Pure Thermal) and N6 OpenMV Cams respectively. The full set of names is
several hundred symbols per family (271 on M4, 306 on M7, 494 on H7, 594
on N6); enumerating them here would simply duplicate ST's reference manual
and CMSIS headers.

Two naming conventions are used:

* Constants named after a peripheral instance (``GPIOA``, ``USART1``,
  ``TIM2``, ...) are **absolute base addresses**.
* Constants prefixed with a peripheral type (``GPIO_BSRR``, ``USART_CR1``,
  ``TIM_CCR1``, ...) are **register offsets** relative to the matching base.

Add an absolute base and a register offset to get the full address of a
single register. For example ``stm.GPIOA + stm.GPIO_BSRR`` is the
absolute address of ``GPIOA->BSRR``.

Example::

    import stm

    # set PA2 high
    stm.mem32[stm.GPIOA + stm.GPIO_BSRR] = 1 << 2

    # read PA3
    value = (stm.mem32[stm.GPIOA + stm.GPIO_IDR] >> 3) & 1

Representative constants
~~~~~~~~~~~~~~~~~~~~~~~~

The selection below covers one entry per major peripheral category, picked
so the naming convention is clear at a glance. Every other CMSIS symbol
for the build target is also available on the module -- see :func:`__getattr__`
below for the type-checker fallback.

.. data:: GPIOA
   :type: int

   Base address of the ``GPIOA`` peripheral. ``GPIOB`` ... ``GPIOK`` (range
   depends on the MCU package) follow the same pattern.

.. data:: USART1
   :type: int

   Base address of the ``USART1`` peripheral. Other USART / UART instances
   are exposed under ``USART2``, ``USART3``, ``UART4`` ... as available.

.. data:: SPI1
   :type: int

   Base address of the ``SPI1`` peripheral. Additional SPI instances appear
   as ``SPI2``, ``SPI3``, ... up to the MCU's count.

.. data:: I2C1
   :type: int

   Base address of the ``I2C1`` peripheral. ``I2C2`` ... ``I2C4`` follow.

.. data:: TIM1
   :type: int

   Base address of the ``TIM1`` advanced-control timer. General-purpose and
   basic timers (``TIM2`` ... ``TIM17`` as available) follow the same naming.

.. data:: ADC1
   :type: int

   Base address of ``ADC1``. ``ADC2`` / ``ADC3`` appear on MCUs with
   multiple ADC blocks.

.. data:: DAC
   :type: int

   Base address of the DAC peripheral, on MCUs that have one.

.. data:: DMA1
   :type: int

   Base address of ``DMA1``. ``DMA2`` is present on most STM32s; H7-class
   parts also expose ``BDMA``, ``MDMA`` and (on the N6) ``HPDMA`` /
   ``GPDMA``.

.. data:: RCC
   :type: int

   Base address of the Reset and Clock Control peripheral.

.. data:: EXTI
   :type: int

   Base address of the External Interrupt / Event Controller.

.. data:: FLASH
   :type: int

   Base address of the embedded flash controller (the peripheral, not
   the flash array itself).

.. data:: SYSCFG
   :type: int

   Base address of the System Configuration Controller.

.. data:: PWR
   :type: int

   Base address of the Power Control peripheral.

.. data:: GPIO_BSRR
   :type: int

   Offset of the GPIO bit set/reset register within any ``GPIOx`` base.

.. data:: GPIO_IDR
   :type: int

   Offset of the GPIO input data register.

.. data:: GPIO_ODR
   :type: int

   Offset of the GPIO output data register.

.. data:: USART_CR1
   :type: int

   Offset of the USART/UART control register 1.

.. data:: TIM_CR1
   :type: int

   Offset of the timer control register 1.

.. data:: TIM_CCR1
   :type: int

   Offset of the timer capture/compare register 1. ``TIM_CCR2`` ...
   ``TIM_CCR4`` follow on timers that have multiple channels.

.. data:: RCC_CR
   :type: int

   Offset of the RCC clock control register.

.. data:: RCC_CFGR
   :type: int

   Offset of the RCC clock configuration register.

.. function:: __getattr__(name: str) -> int

   Dynamic-attribute fallback: any CMSIS symbol exposed by the firmware that
   isn't individually listed above (e.g. ``stm.FDCAN1``, ``stm.OCTOSPI1``,
   ``stm.GPIO_AFR``, the various bit-field shifts and masks, ...) still
   resolves to its absolute address or offset as an ``int``.

   The runtime module populates these symbols directly into its globals dict
   at import time, so ``__getattr__`` is never actually invoked. The signature
   is exposed solely so static type checkers (Pyright, Pylance, mypy)
   accept ``stm.<any CMSIS name>`` without a "module has no attribute"
   diagnostic.


