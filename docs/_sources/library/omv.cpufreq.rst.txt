:mod:`cpufreq` --- CPU Frequency Control
========================================

.. module:: cpufreq
   :synopsis: CPU Frequency Control

The ``cpufreq`` module is used to get/set the CPU frequency to save power.

Functions
---------

.. function:: set_frequency(supported_frequency:int) -> None

   Sets the CPU frequency to a ``supported_frequency`` in MHz. Peripheral
   frequencies are not changed, only the CPU clock. Raises ``OSError`` if
   ``supported_frequency`` is not in the list returned by
   `cpufreq.get_supported_frequencies`.

.. function:: get_current_frequencies() -> Tuple[int, int, int, int]

   Returns a 4-tuple ``(cpu_clk_in_mhz, hclk_in_mhz, pclk1_in_mhz, pclk2_in_mhz)``
   with the current CPU and bus clock frequencies in MHz.

.. function:: get_supported_frequencies() -> List[int]

   Returns a list of supported CPU frequencies in MHz.
