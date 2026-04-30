:mod:`tfp410` --- DVI/HDMI Controller
=====================================

.. module:: tfp410
   :synopsis: DVI/HDMI Controller

The ``tfp410`` module provides a driver for the TFP410 DVI/HDMI serializer used to
drive an external DVI/HDMI display via a 24-bit parallel LCD bus.


class TFP410 -- DVI/HDMI Controller
-----------------------------------

.. class:: TFP410(*, i2c_addr: int=0x3F)

   Initializes the TFP410 DVI/HDMI controller chip.

   ``i2c_addr`` is the I2C address of the TFP410.

   .. method:: isconnected() -> bool

      Returns ``True`` if an external display is connected, ``False`` otherwise.

   .. method:: hotplug_callback(callback: Optional[Callable[[bool], None]]) -> None

      Registers a ``callback`` function that will be called whenever the connection
      state of an external display changes. The new connection state (``bool``) is
      passed as the only argument to ``callback``.

      Pass ``None`` as ``callback`` to disable the hotplug callback.

      While a callback is registered, do not call `TFP410.isconnected()`.
