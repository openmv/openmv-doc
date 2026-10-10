:mod:`ft5x06` --- Touch Screen Driver
=====================================

.. module:: ft5x06
   :synopsis: Touch Screen Driver

The ``ft5x06`` module provides a driver for the FT5x06 capacitive touch screen
controller used on the OpenMV Pure Thermal.


class FT5X06 -- Touch Screen Controller
---------------------------------------

.. class:: FT5X06(i2c_addr: int = 0x38)

   Creates a touch screen controller object.

   ``i2c_addr`` is the I2C address of the FT5x06 controller.

   .. method:: get_gesture() -> int

      Returns the current gesture. The return value is one of the
      ``ft5x06.GESTURE_*`` constants.

      When a callback is registered via `FT5X06.touch_callback()` this method
      should only be called from within the callback.

   .. method:: get_points() -> int

      Returns the current number of touch points (0-5).

      When a callback is registered via `FT5X06.touch_callback()` this method
      should only be called from within the callback.

   .. method:: get_point_flag(index: int) -> int

      Returns the current state of the touch point at ``index`` (0-4). The return
      value is one of the ``ft5x06.FLAG_*`` constants.

      When a callback is registered via `FT5X06.touch_callback()` this method
      should only be called from within the callback.

   .. method:: get_point_id(index: int) -> int

      Returns the id of the touch point at ``index`` (0-4). The id is a numeric
      value that allows tracking a touch point across updates as points are added
      and removed.

      When a callback is registered via `FT5X06.touch_callback()` this method
      should only be called from within the callback.

   .. method:: get_point_x(index: int) -> int

      Returns the x pixel position of the touch point at ``index`` (0-4).

      When a callback is registered via `FT5X06.touch_callback()` this method
      should only be called from within the callback.

   .. method:: get_point_y(index: int) -> int

      Returns the y pixel position of the touch point at ``index`` (0-4).

      When a callback is registered via `FT5X06.touch_callback()` this method
      should only be called from within the callback.

   .. method:: touch_callback(callback: object) -> None

      Registers ``callback`` to be invoked on a touch event. The callback receives
      one argument: the current number of touch points (0-5).

      Pass ``None`` as ``callback`` to disable the callback. While a callback is
      registered, do not call `FT5X06.update_points()` outside of the callback.

   .. method:: update_points() -> int

      Reads the touch screen state and returns the number of touch points (0-5).

Constants
---------

.. data:: ft5x06.GESTURE_MOVE_UP
   :type: int

   Touch screen move up gesture.

.. data:: ft5x06.GESTURE_MOVE_LEFT
   :type: int

   Touch screen move left gesture.

.. data:: ft5x06.GESTURE_MOVE_DOWN
   :type: int

   Touch screen move down gesture.

.. data:: ft5x06.GESTURE_MOVE_RIGHT
   :type: int

   Touch screen move right gesture.

.. data:: ft5x06.GESTURE_ZOOM_IN
   :type: int

   Touch screen zoom in gesture.

.. data:: ft5x06.GESTURE_ZOOM_OUT
   :type: int

   Touch screen zoom out gesture.

.. data:: ft5x06.GESTURE_NONE
   :type: int

   No gesture.

.. data:: ft5x06.FLAG_PRESSED
   :type: int

   Touch point is pressed.

.. data:: ft5x06.FLAG_RELEASED
   :type: int

   Touch point is released.

.. data:: ft5x06.FLAG_MOVED
   :type: int

   Touch point is moved.
