In-System Programming Button
============================

When held down on power up, the ISP button will enable the built in LPC2106
bootloader. After the processor has started up, the button can be read as normal
GPIO. It is internally pulled high, and set low when depressed. The button
shares the ``CS`` pin (``P0.14``) with the MMC. When using the MMC, ``CS`` is
active low and hence the button cannot adversely affect data transfers.
