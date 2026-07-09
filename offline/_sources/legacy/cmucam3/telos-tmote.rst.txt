Telos or Tmote Sky
==================

*This page has been posted in response to many emails we have received asking
about interfacing the Tmote Sky boards with the CMUcam3. We have tested that the
power connections work, however we have not run any application code on the Tmote
boards to communicate with the CMUcam3. From discussions with other people the
configuration seems to be functional, but please use with caution.*

The CMUcam3 can connect to either the Tmote Sky or Telos board using the CMUcam3's
AUX I/O header. This allows the TTL UARTs to be connected as well as the board
power and various other GPIO pins. We currently do not have any sample code
available for TinyOS, but (as always) we would be interested in posting anything
that people contribute.

*Warning: Do not connect a Tmote Sky board directly to the CMUcam3 and power both
devices off of an AC adapter with resistor R6 installed!*

By default the *AUX POWER* pin on the CMUcam3's AUX I/O header is directly
connected to the power input to the CMUcam3. This allows an external connection to
the AUX I/O header to power the CMUcam3 board. In many cases when the CMUcam3 is
given a large power supply such as from an outlet, you may want to change this
configuration to power the wireless node directly from the CMUcam'3 internal
regulator. This can be done by moving the resistor at R6 to R11. It is also
possible to run the CMUcam3 and the sensor board independently by removing both R6
and R11. This can be a useful configuration if you would like the sensor node to
be able to power the CMUcam3 on and off using the Power Enable pin on the CMUcam3.

The AUX I/O power diagram (``aux_io_power.png``) was not preserved in the archive.

Below are two examples of how to power the CMUcam3 and a sensor node from battery
supplies. The left option allows the sensor board to remain on at all times such
that it can gate the power supply to the camera. The right option is simpler to
implement, but does not allow for the camera to be powered down into its lowest
consuming sleep mode. This option is ideal if the CMUcam3 is getting supplied from
an AC adapter or other larger source of energy.

The separate-supply and joint-supply diagrams (``seperate_supply.png`` and
``joint_supply.png``) were not preserved in the archive.

This images shows how to connect a Tmote Sky board to the CMUcam3. Note, that the
battery has been removed and a receptical (S6105-ND from
`Digikey <http://www.digikey.com>`__ ) has been soldered onto the bottom side of
the Tmote Sky board.

The Tmote back and side photos (``tmote_back_sm.jpg`` and ``tmote_side_sm.jpg``)
were not preserved in the archive.

The 10-pin expansion pinout from the Tmote Sky.

The Tmote Sky connector diagram (``tmote_sky_connector.png``) was not preserved in
the archive.

The AUX I/O pinout from the CMUcam3 matches in the same way as shown in the above
photos if the Tmote Sky header is rotated clockwise by 180 degrees.

The CMUcam3 AUX I/O diagram (``CMUcam3_aux_io.png``) was not preserved in the
archive.

The pin mapping is as follows (CMUcam3 -> Tmote Sky):

* Power Enable -> ADC3
* GND -> GND
* \*SCK -> I2C_SDA
* \*MISO -> ADC2
* CAM Reset -> I2C_SCL
* \*CS -> ADC1
* RX2 -> UART0TX
* \*MOSI -> ADC0
* TX2 -> UART0RX
* AUX POWER -> AVCC

* These pins are connected to the SPI bus. Make sure to set them as input on the
  sensor node when the CMUcam3 accesses the SD/MMC card slot.
