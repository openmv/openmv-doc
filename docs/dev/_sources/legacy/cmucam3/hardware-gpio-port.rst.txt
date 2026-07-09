Expansion Port GPIO
===================

The general purpose I/O header allows access to the second UART, various power
control pins and the SPI pins.

Power Enable -- When pulled low, the main CMUcam3 regulator is disabled causing
the board to draw less than 0.01uA. All devices are shutoff and lose all active
state information. When the line is released or pulled high, the board will
reboot. By default, the pin is internally pulled high.

AUX Power -- This pin can be configured to either externally power the board, or
power an expansion board. By default, the pin is connected to the 3.3volt
internal supply. By removing resistor ``R11`` and adding a jumper resistor in
place of ``R6``, the pin is connected to the main power before the 5 volt
regulator.

(GPIO expansion port image ``gpio-expansion.png`` -- not preserved in the
archive.)

* **POWER ENABLE** -- Pulling this pin low will gate power to the entire camera
  board. This will disable the processor, camera and FIFO causing the board to
  consume less than 1uW of power. This pin is pulled high by default with a
  pullup resistor.
* **CAM RESET** -- This pin can be used as external I/O if the camera state is
  not required. Normally this pin resets the camera module and should not be
  used.
* **TX2** -- The transmit pin on UART2 is not level shifted and hence can not be
  directly connected to a PC or none TTL external device. This pin can also be
  used as GPIO.
* **RX2** -- The receive pin on UART2 is not level shifted and hence can not be
  directly connected to a PC or none TTL external device. This pin can also be
  used as GPIO.
* **CS** -- On reboot, if this pin is held low, the LPC2106 will enter bootstrap
  mode. Reboot can be externally induced by pulsing the power enable pin.
  Normally this pin will be controlled by the MMC driver. This pin can also be
  used as GPIO or as the SPI chip select when an MMC card is not inserted.
* **MOSI** -- Normally this pin is controlled by the MMC driver. This pin can
  also be used as GPIO or as an SPI output when an MMC card is not inserted.
* **MISO** -- Normally this pin is controlled by the MMC driver. This pin can
  also be used as GPIO or as an SPI input when an MMC card is not inserted.
* **SCK** -- Normally this pin is controlled by the MMC driver. This pin can
  also be used as GPIO or as the SPI clock pin when an MMC card is not inserted.
