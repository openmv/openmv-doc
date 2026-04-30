:mod:`sensor` --- camera sensor
===============================

.. module:: sensor
   :synopsis: camera sensor

.. deprecated:: 4.5

   The ``sensor`` module is deprecated. Use the new :mod:`csi` module
   (see :doc:`omv.csi`) instead. No new features will be added to this module
   and it may be removed in a future release.

The ``sensor`` module provides legacy access to the camera sensor.

Example usage::

    import sensor

    sensor.reset()
    sensor.set_pixformat(sensor.RGB565)
    sensor.set_framesize(sensor.QVGA)
    sensor.skip_frames(time=2000)

    while True:
        img = sensor.snapshot()

Functions
---------

.. function:: reset() -> None

   Initializes the camera sensor.

.. function:: sleep(enable: bool) -> None

   Puts the camera to sleep if ``enable`` is ``True``. Otherwise, wakes it back up.

.. function:: shutdown(enable: bool) -> None

   Puts the camera into a lower power mode than sleep. The camera must be
   reset on being woken up.

.. function:: flush() -> None

   Copies whatever was in the frame buffer to the IDE preview.

.. function:: snapshot() -> image.Image

   Takes a picture using the camera and returns an `image.Image` object.

   If `sensor.set_auto_rotation()` is enabled this method returns a new
   already rotated `image.Image` object.

.. function:: skip_frames(n: Optional[int] = None, time: int = 300) -> None

   Skips ``n`` frames or ``time`` milliseconds (whichever is specified) to let
   the camera image stabilize after changing camera settings.

   If neither ``n`` nor ``time`` is specified this method skips frames for
   300 milliseconds.

   If both are specified this method skips ``n`` frames but will timeout
   after ``time`` milliseconds.

.. function:: width() -> int

   Returns the sensor resolution width.

.. function:: height() -> int

   Returns the sensor resolution height.

.. function:: get_fb() -> Optional[image.Image]

   Returns the image object returned by a previous call of `sensor.snapshot()`.
   Returns ``None`` if `sensor.snapshot()` has not been called before.

.. function:: get_id() -> int

   Returns the camera module ID. See the sensor constants below.

.. function:: get_frame_available() -> bool

   Returns ``True`` if a frame is available to read by calling `sensor.snapshot()`.

.. function:: alloc_extra_fb(width: int, height: int, pixformat: int) -> image.Image

   .. deprecated:: 4.5

      This function is deprecated and will raise ``OSError``. Use the new
      :mod:`csi` module instead.

.. function:: dealloc_extra_fb() -> None

   .. deprecated:: 4.5

      This function is deprecated and will raise ``OSError``. Use the new
      :mod:`csi` module instead.

.. function:: set_pixformat(pixformat: int) -> None

   Sets the pixel format for the camera module. ``pixformat`` is one of:

      * `sensor.BINARY`
      * `sensor.GRAYSCALE`
      * `sensor.RGB565`
      * `sensor.BAYER`
      * `sensor.YUV422`
      * `sensor.JPEG` (only for the OV2640/OV5640)

.. function:: get_pixformat() -> int

   Returns the current pixformat for the camera module.

.. function:: set_framesize(framesize: int) -> None

   Sets the frame size for the camera module. See the framesize constants
   below for valid values.

.. function:: get_framesize() -> int

   Returns the current frame size for the camera module.

.. function:: set_framerate(rate: int) -> None

   Sets the frame rate in Hz for the camera module.

.. function:: get_framerate() -> int

   Returns the frame rate in Hz for the camera module.

.. function:: set_windowing(roi: Union[Tuple[int, int], Tuple[int, int, int, int], List[int]]) -> None

   Sets the resolution of the camera to a sub-resolution inside of the current
   resolution.

   ``roi`` is a rect tuple/list ``(x, y, w, h)``. You may also pass ``(w, h)``
   and the ``roi`` will be centered on the frame. The arguments may also be
   passed unpacked as positional integers.

.. function:: get_windowing() -> Tuple[int, int, int, int]

   Returns the ``roi`` tuple ``(x, y, w, h)`` previously set with
   `sensor.set_windowing()`.

.. function:: set_gainceiling(gainceiling: int) -> bool

   Set the camera image gain ceiling. Valid values are ``2``, ``4``, ``8``,
   ``16``, ``32``, ``64``, or ``128``. Returns ``True`` on success.

.. function:: set_contrast(contrast: int) -> bool

   Set the camera image contrast. Valid range is ``-3`` to ``+3``. Returns
   ``True`` on success.

.. function:: set_brightness(brightness: int) -> bool

   Set the camera image brightness. Valid range is ``-3`` to ``+3``. Returns
   ``True`` on success.

.. function:: set_saturation(saturation: int) -> bool

   Set the camera image saturation. Valid range is ``-3`` to ``+3``. Returns
   ``True`` on success.

.. function:: set_quality(quality: int) -> bool

   Set the camera image JPEG compression quality. Valid range is ``0`` to ``100``.
   Returns ``True`` on success. Only for the OV2640/OV5640 cameras.

.. function:: set_colorbar(enable: bool) -> bool

   Turns color bar test mode on (``True``) or off (``False``). Returns ``True``
   on success.

.. function:: set_auto_gain(enable: int, gain_db: Optional[float] = None, gain_db_ceiling: Optional[float] = None) -> None

   ``enable`` turns auto gain control on (``1``) or off (``0``).

   If ``enable`` is ``0`` you may set a fixed gain in decibels with ``gain_db``.

   If ``enable`` is non-zero you may set the maximum gain ceiling in decibels
   with ``gain_db_ceiling`` for the automatic gain control algorithm.

   ``gain_db`` and ``gain_db_ceiling`` are keyword-only arguments.

.. function:: get_gain_db() -> float

   Returns the current camera gain value in decibels.

.. function:: set_auto_exposure(enable: int, exposure_us: int = -1) -> None

   ``enable`` turns auto exposure control on (``1``) or off (``0``).

   If ``enable`` is ``0`` you may set a fixed exposure time in microseconds
   with ``exposure_us``. ``exposure_us`` is a keyword-only argument.

.. function:: get_exposure_us() -> int

   Returns the current camera exposure value in microseconds.

.. function:: set_auto_whitebal(enable: int, rgb_gain_db: Optional[Tuple[float, float, float]] = None) -> None

   ``enable`` turns auto white balance on (``1``) or off (``0``).

   If ``enable`` is ``0`` you may set a fixed gain in decibels for the red,
   green, and blue channels respectively with ``rgb_gain_db``.
   ``rgb_gain_db`` is a keyword-only argument.

.. function:: get_rgb_gain_db() -> Tuple[float, float, float]

   Returns a tuple with the current camera red, green, and blue gain values
   in decibels.

.. function:: set_auto_blc(enable: int, regs: Optional[List[int]] = None) -> None

   Sets the auto black level calibration (BLC) control on the camera.

   ``enable`` is ``1`` to enable or ``0`` to disable.

   ``regs`` if disabled, you can manually set the BLC register values via the
   values previously read from `sensor.get_blc_regs()`. The list length must
   match the sensor's BLC register count.

.. function:: get_blc_regs() -> List[int]

   Returns the sensor BLC registers as a list of integers. For use with
   `sensor.set_auto_blc()`.

.. function:: set_hmirror(enable: bool) -> None

   Turns horizontal mirror mode on (``True``) or off (``False``). Defaults to off.

.. function:: get_hmirror() -> bool

   Returns ``True`` if horizontal mirror mode is enabled.

.. function:: set_vflip(enable: bool) -> None

   Turns vertical flip mode on (``True``) or off (``False``). Defaults to off.

.. function:: get_vflip() -> bool

   Returns ``True`` if vertical flip mode is enabled.

.. function:: set_transpose(enable: bool) -> None

   Turns transpose mode on (``True``) or off (``False``). Defaults to off.

      * vflip=False, hmirror=False, transpose=False -> 0 degree rotation
      * vflip=True,  hmirror=False, transpose=True  -> 90 degree rotation
      * vflip=True,  hmirror=True,  transpose=False -> 180 degree rotation
      * vflip=False, hmirror=True,  transpose=True  -> 270 degree rotation

.. function:: get_transpose() -> bool

   Returns ``True`` if transpose mode is enabled.

.. function:: set_auto_rotation(enable: bool) -> None

   Turns auto rotation mode on (``True``) or off (``False``). Defaults to off.
   Only works when the OpenMV Cam has an :py:mod:`imu` installed.

.. function:: get_auto_rotation() -> bool

   Returns ``True`` if auto rotation mode is enabled.

.. function:: set_framebuffers(count: int) -> None

   Sets the number of frame buffers used to receive image data.

   ``count`` may be ``1`` (single buffer), ``2`` (double buffer), ``3``
   (triple buffer), or ``4`` or greater to put the sensor driver into video
   FIFO mode where received frames are stored in a FIFO of ``count`` buffers.

.. function:: get_framebuffers() -> int

   Returns the current number of frame buffers allocated.

.. function:: disable_delays(disable: Optional[bool] = None) -> Optional[bool]

   If ``disable`` is ``True`` then disable all settling time delays in the
   sensor module.

   If called with no arguments returns ``True`` if delays are disabled.

.. function:: disable_full_flush(disable: Optional[bool] = None) -> Optional[bool]

   If ``disable`` is ``True`` then automatic framebuffer flushing on frame
   drop is disabled.

   If called with no arguments returns ``True`` if automatic flushing is
   disabled.

.. function:: set_special_effect(sde: int) -> bool

   Sets the special digital effect (SDE) on the sensor. ``sde`` is one of
   `sensor.NORMAL` or `sensor.NEGATIVE`. Returns ``True`` on success.

.. function:: set_lens_correction(enable: bool, radi: int, coef: int) -> bool

   ``enable`` ``True`` to enable, ``False`` to disable.
   ``radi`` integer radius of pixels to correct.
   ``coef`` power of correction.

   Returns ``True`` on success.

.. function:: set_vsync_callback(cb: Optional[Callable[[int], None]]) -> None

   Registers callback ``cb`` to be executed (in interrupt context) whenever
   the camera module generates a new frame (but before the frame is received).

   ``cb`` takes one argument: the current state of the vsync pin after changing.

   Pass a non-callable (e.g. ``None``) to unregister.

.. function:: set_frame_callback(cb: Optional[Callable[[], None]]) -> None

   Registers callback ``cb`` to be executed (in interrupt context) whenever
   the camera module generates a new frame and the frame is ready to be read
   via `sensor.snapshot()`.

   ``cb`` takes no arguments.

   Pass a non-callable (e.g. ``None``) to unregister.

.. function:: ioctl(request: int, *args: Any) -> Any

   Executes a sensor specific method. ``request`` is one of the
   ``IOCTL_*`` constants documented below. The remaining arguments and the
   return value depend on ``request``:

   * `sensor.IOCTL_SET_READOUT_WINDOW` - Pass a rect tuple ``(x, y, w, h)`` or a size tuple ``(w, h)``.
   * `sensor.IOCTL_GET_READOUT_WINDOW` - Returns the current readout window rect tuple ``(x, y, w, h)``.
   * `sensor.IOCTL_SET_TRIGGERED_MODE` - Pass ``True`` or ``False``.
   * `sensor.IOCTL_GET_TRIGGERED_MODE` - Returns the current triggered-mode state as a ``bool``.
   * `sensor.IOCTL_SET_FOV_WIDE` - Pass ``True`` or ``False`` to optimize `sensor.set_framesize()` for field-of-view over FPS.
   * `sensor.IOCTL_GET_FOV_WIDE` - Returns the current field-of-view-over-FPS optimization state as a ``bool``.
   * `sensor.IOCTL_SET_NIGHT_MODE` - Pass ``True`` or ``False`` to enable/disable night mode.
   * `sensor.IOCTL_GET_NIGHT_MODE` - Returns the current night-mode state as a ``bool``.
   * `sensor.IOCTL_TRIGGER_AUTO_FOCUS` - Triggers auto focus on the OV5640 FPC camera module.
   * `sensor.IOCTL_PAUSE_AUTO_FOCUS` - Pauses auto focus on the OV5640 FPC camera module.
   * `sensor.IOCTL_RESET_AUTO_FOCUS` - Resets auto focus on the OV5640 FPC camera module.
   * `sensor.IOCTL_WAIT_ON_AUTO_FOCUS` - Waits for auto focus to finish on the OV5640 FPC camera module. Optional second argument is the timeout in milliseconds (default ``5000``).
   * `sensor.IOCTL_LEPTON_GET_WIDTH` - Returns the FLIR Lepton image width in pixels.
   * `sensor.IOCTL_LEPTON_GET_HEIGHT` - Returns the FLIR Lepton image height in pixels.
   * `sensor.IOCTL_LEPTON_GET_RADIOMETRY` - Returns the FLIR Lepton type (radiometric or not).
   * `sensor.IOCTL_LEPTON_GET_REFRESH` - Returns the FLIR Lepton refresh rate in Hz.
   * `sensor.IOCTL_LEPTON_GET_RESOLUTION` - Returns the FLIR Lepton ADC resolution in bits.
   * `sensor.IOCTL_LEPTON_RUN_COMMAND` - Pass a 16-bit command id (FLIR Lepton SDK).
   * `sensor.IOCTL_LEPTON_SET_ATTRIBUTE` - Pass the 16-bit attribute id and a ``bytes``/``bytearray`` payload (multiple of 16-bits).
   * `sensor.IOCTL_LEPTON_GET_ATTRIBUTE` - Pass the 16-bit attribute id and the number of 16-bit words to read. Returns a ``bytearray``.
   * `sensor.IOCTL_LEPTON_GET_FPA_TEMP` - Returns the FLIR Lepton FPA temperature in celsius.
   * `sensor.IOCTL_LEPTON_GET_AUX_TEMP` - Returns the FLIR Lepton AUX temperature in celsius.
   * `sensor.IOCTL_LEPTON_SET_MODE` - Pass ``enable`` followed by an optional ``high_temp`` flag.
   * `sensor.IOCTL_LEPTON_GET_MODE` - Returns the tuple ``(measurement-mode-enabled, high-temp-enabled)``.
   * `sensor.IOCTL_LEPTON_SET_RANGE` - Pass ``min_temp_c`` and ``max_temp_c`` floats.
   * `sensor.IOCTL_LEPTON_GET_RANGE` - Returns the sorted ``(min, max)`` 2-tuple temperature range in celsius.
   * `sensor.IOCTL_HIMAX_MD_ENABLE` - Pass ``True``/``False`` to enable/disable motion detection on the HM01B0.
   * `sensor.IOCTL_HIMAX_MD_WINDOW` - Pass a rect tuple ``(x, y, w, h)`` or a size tuple ``(w, h)``.
   * `sensor.IOCTL_HIMAX_MD_THRESHOLD` - Pass a threshold value (``0``-``255``).
   * `sensor.IOCTL_HIMAX_MD_CLEAR` - Clears the motion detection interrupt on the HM01B0.
   * `sensor.IOCTL_HIMAX_OSC_ENABLE` - Pass ``True``/``False`` to enable/disable the HM01B0 oscillator.
   * `sensor.IOCTL_GET_RGB_STATS` - Returns the tuple ``(r, gb, gr, b)`` of RGB statistics from the camera sensor.
   * `sensor.IOCTL_GENX320_SET_BIASES` - Pass one of the ``GENX320_BIASES_*`` constants to set the GENX320 sensor biases.
   * `sensor.IOCTL_GENX320_SET_BIAS` - Pass one of the ``GENX320_BIAS_*`` constants and an integer bias value.
   * `sensor.IOCTL_GENX320_SET_AFK` - Pass either ``enable`` (``True``/``False``) alone or ``enable``, ``freq_low_in_hz``, ``freq_high_in_hz``.

.. function:: set_color_palette(palette: int) -> None

   Sets the color palette for the FLIR Lepton (and similar) grayscale to
   RGB565 conversion. ``palette`` is one of `image.PALETTE_RAINBOW`,
   `image.PALETTE_IRONBOW`, `image.PALETTE_DEPTH`, `image.PALETTE_EVT_DARK`,
   or `image.PALETTE_EVT_LIGHT`.

.. function:: get_color_palette() -> Optional[int]

   Returns the current color palette setting, or ``None`` if the active
   palette is unrecognized.

.. function:: __write_reg(address: int, value: int) -> None

   Write ``value`` to camera register at ``address``.

   .. note:: See the camera data sheet for register info.

.. function:: __read_reg(address: int) -> int

   Read camera register at ``address``.

   .. note:: See the camera data sheet for register info.

Constants
---------

.. data:: BINARY
   :type: int

   BINARY (bitmap) pixel format. Each pixel is 1-bit.

.. data:: GRAYSCALE
   :type: int

   GRAYSCALE pixel format (Y from YUV422). Each pixel is 8-bits, 1-byte.

.. data:: RGB565
   :type: int

   RGB565 pixel format. Each pixel is 16-bits, 2-bytes. 5-bits red, 6-bits
   green, 5-bits blue.

.. data:: BAYER
   :type: int

   RAW BAYER pixel format. 8-bits per pixel.

.. data:: YUV422
   :type: int

   YUV422 pixel format (8-bits Y1, 8-bits U, 8-bits Y2, 8-bits V, etc.).

.. data:: JPEG
   :type: int

   JPEG mode. Compressed JPEG output. Only works for the OV2640/OV5640 cameras.

.. data:: OV2640
   :type: int

   `sensor.get_id()` returns this for the OV2640 camera.

.. data:: OV5640
   :type: int

   `sensor.get_id()` returns this for the OV5640 camera.

.. data:: OV7670
   :type: int

   `sensor.get_id()` returns this for the OV7670 camera.

.. data:: OV7690
   :type: int

   `sensor.get_id()` returns this for the OV7690 camera.

.. data:: OV7725
   :type: int

   `sensor.get_id()` returns this for the OV7725 camera.

.. data:: OV9650
   :type: int

   `sensor.get_id()` returns this for the OV9650 camera.

.. data:: MT9V022
   :type: int

   `sensor.get_id()` returns this for the MT9V022 camera.

.. data:: MT9V024
   :type: int

   `sensor.get_id()` returns this for the MT9V024 camera.

.. data:: MT9V032
   :type: int

   `sensor.get_id()` returns this for the MT9V032 camera.

.. data:: MT9V034
   :type: int

   `sensor.get_id()` returns this for the MT9V034 camera.

.. data:: MT9M114
   :type: int

   `sensor.get_id()` returns this for the MT9M114 camera.

.. data:: BOSON320
   :type: int

   `sensor.get_id()` returns this for the BOSON 320x256 camera.

.. data:: BOSON640
   :type: int

   `sensor.get_id()` returns this for the BOSON 640x512 camera.

.. data:: LEPTON
   :type: int

   `sensor.get_id()` returns this for the LEPTON1/2/3 cameras.

.. data:: HM01B0
   :type: int

   `sensor.get_id()` returns this for the HM01B0 camera.

.. data:: HM0360
   :type: int

   `sensor.get_id()` returns this for the HM0360 camera.

.. data:: GC2145
   :type: int

   `sensor.get_id()` returns this for the GC2145 camera.

.. data:: GENX320ES
   :type: int

   `sensor.get_id()` returns this for the GENX320 (engineering sample) camera.

.. data:: GENX320
   :type: int

   `sensor.get_id()` returns this for the GENX320 camera.

.. data:: PAG7920
   :type: int

   `sensor.get_id()` returns this for the PAG7920 camera.

.. data:: PAG7936
   :type: int

   `sensor.get_id()` returns this for the PAG7936 camera.

.. data:: PAJ6100
   :type: int

   `sensor.get_id()` returns this for the PAJ6100 camera.

.. data:: FROGEYE2020
   :type: int

   `sensor.get_id()` returns this for the FROGEYE2020 camera.

.. data:: NORMAL
   :type: int

   Pass to `sensor.set_special_effect()` for normal (no SDE) output.

.. data:: NEGATIVE
   :type: int

   Pass to `sensor.set_special_effect()` for negative-image output.

.. data:: QQCIF
   :type: int

   88x72 resolution.

.. data:: QCIF
   :type: int

   176x144 resolution.

.. data:: CIF
   :type: int

   352x288 resolution.

.. data:: QQSIF
   :type: int

   88x60 resolution.

.. data:: QSIF
   :type: int

   176x120 resolution.

.. data:: SIF
   :type: int

   352x240 resolution.

.. data:: QQQQVGA
   :type: int

   40x30 resolution.

.. data:: QQQVGA
   :type: int

   80x60 resolution.

.. data:: QQVGA
   :type: int

   160x120 resolution.

.. data:: QVGA
   :type: int

   320x240 resolution.

.. data:: VGA
   :type: int

   640x480 resolution.

.. data:: HQQQQVGA
   :type: int

   40x20 resolution.

.. data:: HQQQVGA
   :type: int

   80x40 resolution.

.. data:: HQQVGA
   :type: int

   160x80 resolution.

.. data:: HQVGA
   :type: int

   240x160 resolution.

.. data:: HVGA
   :type: int

   480x320 resolution.

.. data:: B64X32
   :type: int

   64x32 resolution. For use with `Image.find_displacement()` and other FFT
   based algorithms.

.. data:: B64X64
   :type: int

   64x64 resolution. For use with `Image.find_displacement()` and other FFT
   based algorithms.

.. data:: B128X64
   :type: int

   128x64 resolution. For use with `Image.find_displacement()` and other FFT
   based algorithms.

.. data:: B128X128
   :type: int

   128x128 resolution. For use with `Image.find_displacement()` and other FFT
   based algorithms.

.. data:: B160X160
   :type: int

   160x160 resolution (for the HM01B0).

.. data:: B320X320
   :type: int

   320x320 resolution (for the HM01B0).

.. data:: LCD
   :type: int

   128x160 resolution (for use with the LCD shield).

.. data:: QQVGA2
   :type: int

   128x160 resolution (for use with the LCD shield).

.. data:: WVGA
   :type: int

   720x480 resolution (for the MT9V034).

.. data:: WVGA2
   :type: int

   752x480 resolution (for the MT9V034).

.. data:: SVGA
   :type: int

   800x600 resolution. Only for the OV2640/OV5640 cameras.

.. data:: XGA
   :type: int

   1024x768 resolution. Only for the OV2640/OV5640 cameras.

.. data:: WXGA
   :type: int

   1280x768 resolution (for the MT9M114).

.. data:: SXGA
   :type: int

   1280x1024 resolution. Only for the OV2640/OV5640 cameras.

.. data:: SXGAM
   :type: int

   1280x960 resolution (for the MT9M114).

.. data:: UXGA
   :type: int

   1600x1200 resolution. Only for the OV2640/OV5640 cameras.

.. data:: HD
   :type: int

   1280x720 resolution. Only for the OV2640/OV5640 cameras.

.. data:: FHD
   :type: int

   1920x1080 resolution. Only for the OV5640 camera.

.. data:: QHD
   :type: int

   2560x1440 resolution. Only for the OV5640 camera.

.. data:: QXGA
   :type: int

   2048x1536 resolution. Only for the OV5640 camera.

.. data:: WQXGA
   :type: int

   2560x1600 resolution. Only for the OV5640 camera.

.. data:: WQXGA2
   :type: int

   2592x1944 resolution. Only for the OV5640 camera.

.. data:: IOCTL_SET_READOUT_WINDOW
   :type: int

   Set the sensor readout window. See `sensor.ioctl()`.

.. data:: IOCTL_GET_READOUT_WINDOW
   :type: int

   Get the sensor readout window. See `sensor.ioctl()`.

.. data:: IOCTL_SET_TRIGGERED_MODE
   :type: int

   Set triggered mode (e.g. for the MT9V034). See `sensor.ioctl()`.

.. data:: IOCTL_GET_TRIGGERED_MODE
   :type: int

   Get the current triggered-mode state. See `sensor.ioctl()`.

.. data:: IOCTL_SET_FOV_WIDE
   :type: int

   Optimize `sensor.set_framesize()` for field-of-view over FPS. See
   `sensor.ioctl()`.

.. data:: IOCTL_GET_FOV_WIDE
   :type: int

   Get the current field-of-view-over-FPS optimization state. See
   `sensor.ioctl()`.

.. data:: IOCTL_TRIGGER_AUTO_FOCUS
   :type: int

   Trigger auto focus on the OV5640 FPC camera module. See `sensor.ioctl()`.

.. data:: IOCTL_PAUSE_AUTO_FOCUS
   :type: int

   Pause auto focus on the OV5640 FPC camera module. See `sensor.ioctl()`.

.. data:: IOCTL_RESET_AUTO_FOCUS
   :type: int

   Reset auto focus on the OV5640 FPC camera module. See `sensor.ioctl()`.

.. data:: IOCTL_WAIT_ON_AUTO_FOCUS
   :type: int

   Wait on auto focus to complete on the OV5640 FPC camera module. See
   `sensor.ioctl()`.

.. data:: IOCTL_SET_NIGHT_MODE
   :type: int

   Enable/disable night mode on the sensor. See `sensor.ioctl()`.

.. data:: IOCTL_GET_NIGHT_MODE
   :type: int

   Get the current night-mode state. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_WIDTH
   :type: int

   Get the FLIR Lepton image width in pixels. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_HEIGHT
   :type: int

   Get the FLIR Lepton image height in pixels. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_RADIOMETRY
   :type: int

   Get the FLIR Lepton type (radiometric or not). See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_REFRESH
   :type: int

   Get the FLIR Lepton refresh rate in Hz. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_RESOLUTION
   :type: int

   Get the FLIR Lepton ADC resolution in bits. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_RUN_COMMAND
   :type: int

   Execute a 16-bit FLIR Lepton SDK command. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_SET_ATTRIBUTE
   :type: int

   Set a FLIR Lepton attribute. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_ATTRIBUTE
   :type: int

   Get a FLIR Lepton attribute. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_FPA_TEMP
   :type: int

   Get the FLIR Lepton FPA temperature in celsius. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_AUX_TEMP
   :type: int

   Get the FLIR Lepton AUX temperature in celsius. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_SET_MODE
   :type: int

   Set FLIR Lepton measurement mode. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_MODE
   :type: int

   Get FLIR Lepton measurement-mode state. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_SET_RANGE
   :type: int

   Set the FLIR Lepton measurement-mode temperature range. See `sensor.ioctl()`.

.. data:: IOCTL_LEPTON_GET_RANGE
   :type: int

   Get the FLIR Lepton measurement-mode temperature range. See `sensor.ioctl()`.

.. data:: IOCTL_HIMAX_MD_ENABLE
   :type: int

   Enable/disable HM01B0 motion detection. See `sensor.ioctl()`.

.. data:: IOCTL_HIMAX_MD_WINDOW
   :type: int

   Set the HM01B0 motion detection window. See `sensor.ioctl()`.

.. data:: IOCTL_HIMAX_MD_THRESHOLD
   :type: int

   Set the HM01B0 motion detection threshold. See `sensor.ioctl()`.

.. data:: IOCTL_HIMAX_MD_CLEAR
   :type: int

   Clear the HM01B0 motion detection interrupt. See `sensor.ioctl()`.

.. data:: IOCTL_HIMAX_OSC_ENABLE
   :type: int

   Enable/disable the HM01B0 internal oscillator. See `sensor.ioctl()`.

.. data:: IOCTL_GET_RGB_STATS
   :type: int

   Get the ``(r, gb, gr, b)`` RGB statistics from the sensor. See
   `sensor.ioctl()`.

.. data:: IOCTL_GENX320_SET_BIASES
   :type: int

   Set the GENX320 sensor bias preset. See `sensor.ioctl()`.

.. data:: IOCTL_GENX320_SET_BIAS
   :type: int

   Set a single GENX320 sensor bias. See `sensor.ioctl()`.

.. data:: IOCTL_GENX320_SET_AFK
   :type: int

   Set GENX320 anti-flickering-filter parameters. See `sensor.ioctl()`.

.. data:: GENX320_BIASES_DEFAULT
   :type: int

   Default biases preset for the GENX320.

.. data:: GENX320_BIASES_LOW_LIGHT
   :type: int

   Low-light biases preset for the GENX320.

.. data:: GENX320_BIASES_ACTIVE_MARKER
   :type: int

   Active-marker biases preset for the GENX320.

.. data:: GENX320_BIASES_LOW_NOISE
   :type: int

   Low-noise biases preset for the GENX320.

.. data:: GENX320_BIASES_HIGH_SPEED
   :type: int

   High-speed biases preset for the GENX320.

.. data:: GENX320_BIAS_DIFF_OFF
   :type: int

   GENX320 ``DIFF_OFF`` bias selector.

.. data:: GENX320_BIAS_DIFF_ON
   :type: int

   GENX320 ``DIFF_ON`` bias selector.

.. data:: GENX320_BIAS_FO
   :type: int

   GENX320 ``FO`` bias selector.

.. data:: GENX320_BIAS_HPF
   :type: int

   GENX320 ``HPF`` bias selector.

.. data:: GENX320_BIAS_REFR
   :type: int

   GENX320 ``REFR`` bias selector.
