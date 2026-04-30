.. currentmodule:: csi

:mod:`csi` --- camera sensors
=============================

.. module:: csi
   :synopsis: camera sensors

The ``csi`` module is used for controlling camera sensors.

Example usage::

    import csi

    # Setup camera.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.QVGA)
    csi0.snapshot(time=2000)  # skip frames

    # Take pictures.
    while(True):
        csi0.snapshot()


class CSI -- Camera Sensor Interface
------------------------------------

The `CSI` class is used to control a camera sensor.

.. class:: CSI(cid:int=-1, delays:bool=True, fflush:bool=True, stream:Optional[bool]=None)

   Create an object to talk with a camera sensor. On boards with multiple sensors, the particular
   CSI object may be selected by passing a ``cid`` like `csi.LEPTON` to select a FLIR Lepton sensor
   module. If ``cid`` is -1 the primary sensor is selected (typically a color camera module on
   multi-sensor boards).

   If ``delays`` is ``False`` then all settling time delays in the csi driver are disabled. By
   default the sensor driver delays after reset / mode change to prevent corrupt frames being
   returned by `CSI.snapshot`. Disabling delays lets you batch updates and apply a single delay at
   the end before calling `CSI.snapshot`.

   If ``fflush`` is ``False`` then automatic framebuffer flushing mentioned in `CSI.framebuffers`
   is disabled. This removes any time limit on frames in the frame buffer fifo.

   ``stream`` selects whether this CSI is the stream source sent to the IDE. If ``None`` (default)
   the CSI becomes the stream source only if it is the primary (non-auxiliary) sensor. Pass
   ``True`` to force this CSI to be the stream source, or any false value to leave the existing
   stream source unchanged.

   Methods
   ~~~~~~~

   .. method:: reset(hard:bool=True) -> None

      Initializes the camera sensor. Performs a hardware reset by toggling the RESET signal GPIO
      to the camera module if ``hard`` is ``True``. ``hard`` should be set to false when resetting
      auxiliary camera sensors that share the same RESET signal GPIO as the primary module.

   .. method:: shutdown(enable:bool) -> None

      Puts the camera into a lower power mode than sleep (but the camera must be reset on being
      woken up).

   .. method:: sleep(enable:bool) -> None

      Puts the camera to sleep if ``enable`` is True. Otherwise, wakes it back up.

   .. method:: flush() -> None

      Copies the current frame buffer contents to the IDE preview. Call this after the last
      `CSI.snapshot` if the script terminates so the IDE shows the last frame.

   .. method:: snapshot(time:int=-1, frames:int=-1, blocking:bool=True, image:Optional[image.Image]=None) -> Optional[image.Image]

      Takes a picture using the camera and returns an `image.Image` object.

      If ``time`` and/or ``frames`` is passed snapshot will block for that many ``time``
      milliseconds and/or ``frames`` captured from the camera. Both arguments may be used at the
      same time. After ``time`` and/or ``frames`` has passed snapshot will return ``None``.

      ``blocking`` may be ``False`` to enable non-blocking behavior which will cause snapshot to
      return ``None`` when the next image from the camera is not ready versus waiting.

      ``image`` may be another `image.Image` object to update with the new image captured from the
      camera instead of returning a new `image.Image` object. The previous image contents are
      overwritten via a deep copy.

      If `CSI.auto_rotation` is enabled this method will return an already-rotated `image.Image`.

   .. method:: width() -> int

      Returns the sensor resolution width.

   .. method:: height() -> int

      Returns the sensor resolution height.

   .. method:: cid() -> int

      Returns the camera module chip ID. Compare against any of `csi.OV2640`, `csi.OV5640`,
      `csi.OV7670`, `csi.OV7690`, `csi.OV7725`, `csi.OV9650`, `csi.MT9V022`, `csi.MT9V024`,
      `csi.MT9V032`, `csi.MT9V034`, `csi.MT9M114`, `csi.BOSON320`, `csi.BOSON640`, `csi.LEPTON`,
      `csi.HM01B0`, `csi.HM0360`, `csi.GC2145`, `csi.GENX320ES`, `csi.GENX320`, `csi.PAG7920`,
      `csi.PAG7936`, `csi.PAJ6100`, `csi.FROGEYE2020`, or `csi.SOFTCSI`.

   .. method:: readable() -> bool

      Returns ``True`` if there is an image ready to be returned by `CSI.snapshot` so a call to
      snapshot will not block.

   .. method:: pixformat(pixformat:Optional[int]=None) -> Optional[int]

      Sets the pixel format for the camera module to one of `csi.GRAYSCALE`, `csi.RGB565`,
      `csi.BAYER`, `csi.YUV422`, or `csi.JPEG` (only on the OV2640/OV5640).

      Returns the current pixformat if called with no arguments.

   .. method:: framesize(framesize:Optional[Union[int,Tuple[int,int]]]=None) -> Optional[int]

      Sets the frame size for the camera module to one of the size constants (e.g. `csi.QVGA`,
      `csi.VGA`, `csi.HD`, etc. — see the constants section).

      Alternatively, you may pass a custom framesize as a ``(w, h)`` tuple. When `CSI.snapshot` is
      called the custom framesize will be evaluated against DMA rules. Generally framesizes need
      to be a multiple of 8 pixels and/or 16 bytes.

      Returns the current framesize if called with no arguments.

   .. method:: framerate(rate:Optional[int]=None) -> Optional[int]

      Sets the frame rate in Hz for the camera module.

      Returns the current framerate if called with no arguments.

      .. note::

         `CSI.framerate` works by dropping frames received by the camera module to keep the frame
         rate at or below the rate specified. By default the camera will run at the maximum frame
         rate. If implemented for the particular camera sensor `CSI.framerate` will also reduce
         the camera sensor frame rate internally to save power and improve image quality by
         increasing the sensor exposure. `CSI.framerate` may conflict with `CSI.auto_exposure` on
         some cameras.

   .. method:: window(roi:Optional[Union[Tuple[int,int],Tuple[int,int,int,int]]]=None) -> Optional[Tuple[int,int,int,int]]

      Sets the resolution of the camera to a sub-region of the current resolution. ``roi`` is a
      ``(x, y, w, h)`` tuple. You may also pass ``(w, h)`` and the window will be centered.

      Returns the current ``(x, y, w, h)`` tuple if called with no arguments.

   .. method:: gainceiling(gainceiling:int) -> bool

      Set the camera image gainceiling to one of 2, 4, 8, 16, 32, 64, or 128.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: brightness(brightness:int) -> bool

      Set the camera image brightness.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: contrast(contrast:int) -> bool

      Set the camera image contrast.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: saturation(saturation:int) -> bool

      Set the camera image saturation.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: quality(quality:int) -> bool

      Set the camera image JPEG compression quality. 0 - 100.

      Returns ``True`` on success and ``False`` on failure.

      .. note::

         Only for the OV2640/OV5640 cameras.

   .. method:: colorbar(enable:bool) -> bool

      Turns color bar mode on (``True``) or off (``False``). Defaults to off.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: auto_gain(enable:bool, gain_db:Optional[float]=None, gain_db_ceiling:Optional[float]=None) -> None

      ``enable`` turns auto gain control on (``True``) or off (``False``). The camera starts up
      with auto gain control on.

      If ``enable`` is ``False`` you may set a fixed gain in decibels with ``gain_db``.

      If ``enable`` is ``True`` you may set the maximum gain ceiling in decibels with
      ``gain_db_ceiling`` for the automatic gain control algorithm.

      .. note::

         You need to turn off white balance too if you want to track colors.

   .. method:: gain_db() -> float

      Returns the current camera gain value in decibels.

   .. method:: auto_exposure(enable:bool, exposure_us:int=-1) -> None

      ``enable`` turns auto exposure control on (``True``) or off (``False``). The camera starts
      up with auto exposure control on.

      If ``enable`` is ``False`` you may set a fixed exposure time in microseconds with
      ``exposure_us``.

      .. note::

         Camera auto exposure algorithms are pretty conservative about how much they adjust the
         exposure value by and will generally avoid changing the exposure value by much. Instead,
         they change the gain value a lot to deal with changing lighting.

   .. method:: exposure_us() -> int

      Returns the current camera exposure value in microseconds.

   .. method:: auto_whitebal(enable:bool, rgb_gain_db:Optional[Tuple[float,float,float]]=None) -> None

      ``enable`` turns auto white balance on (``True``) or off (``False``). The camera starts up
      with auto white balance on.

      If ``enable`` is ``False`` you may set a fixed gain in decibels for the red, green, and blue
      channels respectively with ``rgb_gain_db``.

      .. note::

         You need to turn off gain control too if you want to track colors.

   .. method:: rgb_gain_db() -> Tuple[float,float,float]

      Returns a tuple ``(r, g, b)`` of the current camera red, green, and blue gain values in
      decibels.

   .. method:: auto_blc(enable:bool, regs:Optional[List[int]]=None) -> None

      Sets the auto black-level calibration (BLC) on the camera.

      ``enable`` pass ``True`` or ``False`` to turn BLC on or off. You typically always want this
      on.

      ``regs`` if disabled then you can manually set the BLC register values from a previous call
      to `CSI.blc_regs`.

   .. method:: blc_regs() -> List[int]

      Returns the sensor BLC registers as a list of integers. For use with `CSI.auto_blc`.

   .. method:: hmirror(enable:Optional[bool]=None) -> Optional[bool]

      Turns horizontal mirror mode on (``True``) or off (``False``). Defaults to off.

      Returns the current setting if called with no arguments.

   .. method:: vflip(enable:Optional[bool]=None) -> Optional[bool]

      Turns vertical flip mode on (``True``) or off (``False``). Defaults to off.

      Returns the current setting if called with no arguments.

   .. method:: transpose(enable:Optional[bool]=None) -> Optional[bool]

      Turns transpose mode on (``True``) or off (``False``). Defaults to off.

         * vflip=False, hmirror=False, transpose=False -> 0 degree rotation
         * vflip=True,  hmirror=False, transpose=True  -> 90 degree rotation
         * vflip=True,  hmirror=True,  transpose=False -> 180 degree rotation
         * vflip=False, hmirror=True,  transpose=True  -> 270 degree rotation

      Returns the current setting if called with no arguments.

   .. method:: auto_rotation(enable:Optional[bool]=None) -> Optional[bool]

      Turns auto rotation mode on (``True``) or off (``False``). Defaults to off.

      Returns the current setting if called with no arguments.

      .. note::

         This method only works when the OpenMV Cam has an :py:mod:`imu` installed and is enabled
         automatically.

   .. method:: framebuffers(count:Optional[int]=None) -> Optional[int]

      Sets the number of frame buffers used to receive image data. By default the OpenMV Cam will
      try to allocate the maximum number of frame buffers it can. Reallocation occurs whenever
      `CSI.pixformat`, `CSI.framesize`, or `CSI.window` are called.

      ``count`` of 1 (single buffer), 2 (double buffer), or 3 (triple buffer) selects the
      corresponding capture mode. Pass 4 or greater to put the driver into video FIFO mode where
      ``count`` buffers are queued — useful for video recording to an SD card. On frame drop, all
      frame buffers except the active one are cleared so `CSI.snapshot` always returns a recent
      frame.

      Returns the current count if called with no arguments.

   .. method:: special_effect(effect:int) -> bool

      Sets the special digital effect (one of `csi.NORMAL` or `csi.NEGATIVE`).

      Returns ``True`` on success and ``False`` on failure.

   .. method:: lens_correction(enable:bool, radi:int, coef:int) -> bool

      ``enable`` ``True`` to enable, ``False`` to disable.
      ``radi`` integer radius of pixels to correct.
      ``coef`` power of correction.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: vsync_callback(cb:Optional[Callable[[int],None]]=None) -> Optional[Callable[[int],None]]

      Registers callback ``cb`` to be executed (in interrupt context) whenever the camera module
      generates a new frame (but before the frame is received).

      ``cb`` takes one argument and is passed the current state of the vsync pin after changing.

      Returns the registered callback if called with no arguments. Pass any non-callable to clear
      the callback.

   .. method:: frame_callback(cb:Optional[Callable[[],None]]=None) -> Optional[Callable[[],None]]

      Registers callback ``cb`` to be executed (in interrupt context) whenever the camera module
      generates a new frame and the frame is ready to be read via `CSI.snapshot`.

      ``cb`` takes no arguments. Use this to schedule reading a frame later with
      ``micropython.schedule()``.

      Returns the registered callback if called with no arguments. Pass any non-callable to clear
      the callback.

   .. method:: ioctl(request:int, *args) -> Any

      Executes a sensor-specific request. The first argument is one of the ``IOCTL_*`` constants;
      additional arguments and return value depend on the request.

      * `csi.IOCTL_SET_READOUT_WINDOW` — Pass an ``(x, y, w, h)`` or ``(w, h)`` tuple/list to set
        the readout window of the sensor. Increases frame rate at the cost of field-of-view.
      * `csi.IOCTL_GET_READOUT_WINDOW` — Returns the current readout window as ``(x, y, w, h)``.
      * `csi.IOCTL_SET_TRIGGERED_MODE` — Pass ``True``/``False`` to set triggered mode (MT9V034).
      * `csi.IOCTL_GET_TRIGGERED_MODE` — Returns the current triggered mode state.
      * `csi.IOCTL_SET_FOV_WIDE` — Pass ``True``/``False`` to enable `CSI.framesize` to optimize
        for field-of-view over FPS.
      * `csi.IOCTL_GET_FOV_WIDE` — Returns the current FOV-wide state.
      * `csi.IOCTL_SET_NIGHT_MODE` — Pass ``True``/``False`` to enable night mode (OV7725, OV5640).
      * `csi.IOCTL_GET_NIGHT_MODE` — Returns the current night mode state.
      * `csi.IOCTL_TRIGGER_AUTO_FOCUS` — Trigger auto focus on the OV5640 FPC module.
      * `csi.IOCTL_PAUSE_AUTO_FOCUS` — Pause auto focus on the OV5640 FPC module.
      * `csi.IOCTL_RESET_AUTO_FOCUS` — Reset auto focus on the OV5640 FPC module.
      * `csi.IOCTL_WAIT_ON_AUTO_FOCUS` — Wait for auto focus to finish (OV5640 FPC). Optional
        second argument is the timeout in ms (default 5000).
      * `csi.IOCTL_LEPTON_GET_WIDTH` — Returns the FLIR Lepton image width in pixels.
      * `csi.IOCTL_LEPTON_GET_HEIGHT` — Returns the FLIR Lepton image height in pixels.
      * `csi.IOCTL_LEPTON_GET_RADIOMETRY` — Returns the FLIR Lepton type (radiometric or not).
      * `csi.IOCTL_LEPTON_GET_REFRESH` — Returns the FLIR Lepton refresh rate in Hz.
      * `csi.IOCTL_LEPTON_GET_RESOLUTION` — Returns the FLIR Lepton ADC resolution in bits.
      * `csi.IOCTL_LEPTON_RUN_COMMAND` — Pass a 16-bit value as the FLIR Lepton SDK command.
      * `csi.IOCTL_LEPTON_SET_ATTRIBUTE` — Pass the 16-bit attribute id and a bytes/bytearray
        payload (multiple of 16 bits) as defined by the FLIR Lepton SDK.
      * `csi.IOCTL_LEPTON_GET_ATTRIBUTE` — Pass the 16-bit attribute id and a 16-bit-word count.
        Returns a bytearray.
      * `csi.IOCTL_LEPTON_GET_FPA_TEMP` — Returns the FLIR Lepton FPA temp in Celsius.
      * `csi.IOCTL_LEPTON_GET_AUX_TEMP` — Returns the FLIR Lepton AUX temp in Celsius.
      * `csi.IOCTL_LEPTON_SET_MODE` — Pass ``measurement_enabled`` and optionally
        ``high_temp_enabled`` to switch the Lepton between AGC and direct-temperature output.
      * `csi.IOCTL_LEPTON_GET_MODE` — Returns ``(measurement_enabled, high_temp_enabled)``.
      * `csi.IOCTL_LEPTON_SET_RANGE` — Pass ``(min_celsius, max_celsius)`` to set the temperature
        range mapped to 0..255 when measurement mode is enabled.
      * `csi.IOCTL_LEPTON_GET_RANGE` — Returns the ``(min, max)`` temperature range in Celsius.
      * `csi.IOCTL_HIMAX_MD_ENABLE` — Pass ``True``/``False`` to enable HM01B0 motion detection.
      * `csi.IOCTL_HIMAX_MD_WINDOW` — Pass ``(x, y, w, h)`` or ``(w, h)`` to set the HM01B0 motion
        detection window.
      * `csi.IOCTL_HIMAX_MD_THRESHOLD` — Pass a 0-255 threshold for HM01B0 motion detection.
      * `csi.IOCTL_HIMAX_MD_CLEAR` — Clears the HM01B0 motion detection interrupt.
      * `csi.IOCTL_HIMAX_OSC_ENABLE` — Pass ``True``/``False`` to enable the HM01B0 oscillator.
      * `csi.IOCTL_GET_RGB_STATS` — Returns ``(r, gb, gr, b)`` RGB statistics from the sensor.
      * `csi.IOCTL_GENX320_SET_BIASES` — Pass a ``GENX320_BIASES_*`` constant to apply a bias
        preset.
      * `csi.IOCTL_GENX320_SET_BIAS` — Pass a ``GENX320_BIAS_*`` constant and an integer value to
        set a single bias.
      * `csi.IOCTL_GENX320_SET_AFK` — Pass ``enable`` (and optionally ``freq_low_hz``,
        ``freq_high_hz``) to control the anti-flicker filter.
      * `csi.IOCTL_GENX320_SET_STC` — Pass a ``GENX320_STC_*`` constant (and optionally up to two
        further arguments) to control spatio-temporal contrast filtering.
      * `csi.IOCTL_GENX320_SET_MODE` — Pass a ``GENX320_MODE_*`` constant. For event mode, pass
        the row-axis length of the event ``ndarray`` as the second argument.
      * `csi.IOCTL_GENX320_READ_EVENTS` — Pass a uint16 ``ndarray`` of shape ``(EVT_res, 6)`` (with
        ``EVT_res`` a power of two between 1024 and 65536). The columns are
        ``[0]`` event type (`csi.PIX_OFF_EVENT`/`csi.PIX_ON_EVENT`/trigger), ``[1]`` seconds,
        ``[2]`` milliseconds, ``[3]`` microseconds, ``[4]`` x coordinate, ``[5]`` y coordinate.
        Returns the number of events written.
      * `csi.IOCTL_GENX320_CALIBRATE` — Pass an integer iteration count and a sigma float to turn
        off pixels outside ``sigma`` standard deviations of the normal distribution. Returns the
        number of pixels disabled.
      * `csi.IOCTL_GENX320_READ_EVENTS_RAW` — Returns an `image.Image` containing the raw event
        frame from the GENX320.

   .. method:: color_palette(palette:Optional[int]=None) -> Optional[int]

      Sets the color palette to use for things like FLIR Lepton grayscale to RGB565 conversion or
      GENX320 event visualization. One of `image.PALETTE_RAINBOW`, `image.PALETTE_IRONBOW`,
      and (when supported) `image.PALETTE_DEPTH`, `image.PALETTE_EVT_DARK`, or
      `image.PALETTE_EVT_LIGHT`.

      Returns the current setting if called with no arguments.

   .. method:: __write_reg(address:int, value:int) -> None

      Write ``value`` to the camera register at ``address``.

      .. note:: See the camera data sheet for register info.

   .. method:: __read_reg(address:int) -> int

      Read the camera register at ``address``.

      .. note:: See the camera data sheet for register info.

Functions
---------

.. function:: devices() -> List[int]

   Returns a list of the detected sensor chip IDs.

Constants
---------

.. data:: BINARY
   :type: int

   BINARY (bitmap) pixel format. Each pixel is 1-bit. Useful for mask storage; can be used with
   `image.Image()`.

.. data:: GRAYSCALE
   :type: int

   GRAYSCALE pixel format (Y from YUV422). Each pixel is 8-bits.

.. data:: RGB565
   :type: int

   RGB565 pixel format. Each pixel is 16-bits (5-bits red, 6-bits green, 5-bits blue).

.. data:: BAYER
   :type: int

   RAW BAYER image pixel format.

.. data:: YUV422
   :type: int

   YUV422 pixel format. Each pixel is stored as a grayscale 8-bit Y value followed by alternating
   8-bit U/V color values shared between two Y values (Y1, U, Y2, V, ...). Only some image
   processing methods work with YUV422.

.. data:: JPEG
   :type: int

   JPEG mode. The camera module outputs compressed JPEG images. Use `CSI.quality` to control the
   JPEG quality. Only works for the OV2640/OV5640 cameras.

.. data:: OV2640
   :type: int

   `CSI.cid` returns this for the OV2640 camera.

.. data:: OV5640
   :type: int

   `CSI.cid` returns this for the OV5640 camera.

.. data:: OV7670
   :type: int

   `CSI.cid` returns this for the OV7670 camera.

.. data:: OV7690
   :type: int

   `CSI.cid` returns this for the OV7690 camera.

.. data:: OV7725
   :type: int

   `CSI.cid` returns this for the OV7725 camera.

.. data:: OV9650
   :type: int

   `CSI.cid` returns this for the OV9650 camera.

.. data:: MT9V022
   :type: int

   `CSI.cid` returns this for the MT9V022 camera.

.. data:: MT9V024
   :type: int

   `CSI.cid` returns this for the MT9V024 camera.

.. data:: MT9V032
   :type: int

   `CSI.cid` returns this for the MT9V032 camera.

.. data:: MT9V034
   :type: int

   `CSI.cid` returns this for the MT9V034 camera.

.. data:: MT9M114
   :type: int

   `CSI.cid` returns this for the MT9M114 camera.

.. data:: BOSON320
   :type: int

   `CSI.cid` returns this for the BOSON 320x256 camera.

.. data:: BOSON640
   :type: int

   `CSI.cid` returns this for the BOSON 640x512 camera.

.. data:: LEPTON
   :type: int

   `CSI.cid` returns this for the LEPTON1/2/3 cameras.

.. data:: HM01B0
   :type: int

   `CSI.cid` returns this for the HM01B0 camera.

.. data:: HM0360
   :type: int

   `CSI.cid` returns this for the HM0360 camera.

.. data:: GC2145
   :type: int

   `CSI.cid` returns this for the GC2145 camera.

.. data:: GENX320ES
   :type: int

   `CSI.cid` returns this for the GENX320 (engineering sample) camera.

.. data:: GENX320
   :type: int

   `CSI.cid` returns this for the GENX320 camera.

.. data:: PAG7920
   :type: int

   `CSI.cid` returns this for the PAG7920 camera.

.. data:: PAG7936
   :type: int

   `CSI.cid` returns this for the PAG7936 camera.

.. data:: PAJ6100
   :type: int

   `CSI.cid` returns this for the PAJ6100 camera.

.. data:: FROGEYE2020
   :type: int

   `CSI.cid` returns this for the FROGEYE2020 camera.

.. data:: SOFTCSI
   :type: int

   `CSI.cid` returns this for the software CSI camera.

.. data:: NORMAL
   :type: int

   Normal mode for `CSI.special_effect`.

.. data:: NEGATIVE
   :type: int

   Negative mode for `CSI.special_effect`.

.. data:: QCIF
   :type: int

   176x144 resolution for the camera sensor.

.. data:: CIF
   :type: int

   352x288 resolution for the camera sensor.

.. data:: QSIF
   :type: int

   176x120 resolution for the camera sensor.

.. data:: SIF
   :type: int

   352x240 resolution for the camera sensor.

.. data:: QQQVGA
   :type: int

   80x60 resolution for the camera sensor.

.. data:: QQVGA
   :type: int

   160x120 resolution for the camera sensor.

.. data:: QVGA
   :type: int

   320x240 resolution for the camera sensor.

.. data:: VGA
   :type: int

   640x480 resolution for the camera sensor.

.. data:: HQVGA
   :type: int

   240x160 resolution for the camera sensor.

.. data:: HVGA
   :type: int

   480x320 resolution for the camera sensor.

.. data:: WVGA
   :type: int

   720x480 resolution for the MT9V034 camera sensor.

.. data:: WVGA2
   :type: int

   752x480 resolution for the MT9V034 camera sensor.

.. data:: SVGA
   :type: int

   800x600 resolution for the camera sensor.

.. data:: XGA
   :type: int

   1024x768 resolution for the camera sensor.

.. data:: WXGA
   :type: int

   1280x768 resolution for the MT9M114 camera sensor.

.. data:: SXGA
   :type: int

   1280x1024 resolution for the camera sensor. Only works for the OV2640/OV5640 cameras.

.. data:: SXGAM
   :type: int

   1280x960 resolution for the MT9M114 camera sensor.

.. data:: UXGA
   :type: int

   1600x1200 resolution for the camera sensor. Only works for the OV2640/OV5640 cameras.

.. data:: HD
   :type: int

   1280x720 resolution for the camera sensor.

.. data:: FHD
   :type: int

   1920x1080 resolution for the camera sensor. Only works for the OV5640 camera.

.. data:: QHD
   :type: int

   2560x1440 resolution for the camera sensor. Only works for the OV5640 camera.

.. data:: QXGA
   :type: int

   2048x1536 resolution for the camera sensor. Only works for the OV5640 camera.

.. data:: WQXGA
   :type: int

   2560x1600 resolution for the camera sensor. Only works for the OV5640 camera.

.. data:: WQXGA2
   :type: int

   2592x1944 resolution for the camera sensor. Only works for the OV5640 camera.

.. data:: IOCTL_SET_READOUT_WINDOW
   :type: int

   Sets the readout window. See `CSI.ioctl`.

.. data:: IOCTL_GET_READOUT_WINDOW
   :type: int

   Gets the readout window. See `CSI.ioctl`.

.. data:: IOCTL_SET_TRIGGERED_MODE
   :type: int

   Sets triggered mode for the MT9V034. See `CSI.ioctl`.

.. data:: IOCTL_GET_TRIGGERED_MODE
   :type: int

   Gets the triggered mode state for the MT9V034. See `CSI.ioctl`.

.. data:: IOCTL_SET_FOV_WIDE
   :type: int

   Enable `CSI.framesize` to optimize for field-of-view over FPS. See `CSI.ioctl`.

.. data:: IOCTL_GET_FOV_WIDE
   :type: int

   Returns whether `CSI.framesize` is optimizing for field-of-view over FPS. See `CSI.ioctl`.

.. data:: IOCTL_TRIGGER_AUTO_FOCUS
   :type: int

   Trigger auto focus on the OV5640 FPC camera module. See `CSI.ioctl`.

.. data:: IOCTL_PAUSE_AUTO_FOCUS
   :type: int

   Pause auto focus (while running) for the OV5640 FPC camera module. See `CSI.ioctl`.

.. data:: IOCTL_RESET_AUTO_FOCUS
   :type: int

   Reset auto focus to default for the OV5640 FPC camera module. See `CSI.ioctl`.

.. data:: IOCTL_WAIT_ON_AUTO_FOCUS
   :type: int

   Wait for auto focus to finish on the OV5640 FPC camera module. See `CSI.ioctl`.

.. data:: IOCTL_SET_NIGHT_MODE
   :type: int

   Turn night mode on or off. Reduces frame rate to increase exposure dynamically. See `CSI.ioctl`.

.. data:: IOCTL_GET_NIGHT_MODE
   :type: int

   Returns whether night mode is enabled. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_WIDTH
   :type: int

   Returns the FLIR Lepton image resolution width in pixels. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_HEIGHT
   :type: int

   Returns the FLIR Lepton image resolution height in pixels. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_RADIOMETRY
   :type: int

   Returns the FLIR Lepton type (radiometric or not). See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_REFRESH
   :type: int

   Returns the FLIR Lepton refresh rate in Hz. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_RESOLUTION
   :type: int

   Returns the FLIR Lepton ADC resolution in bits. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_RUN_COMMAND
   :type: int

   Executes a 16-bit command from the FLIR Lepton SDK. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_SET_ATTRIBUTE
   :type: int

   Sets a FLIR Lepton attribute from the FLIR Lepton SDK. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_ATTRIBUTE
   :type: int

   Gets a FLIR Lepton attribute from the FLIR Lepton SDK. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_FPA_TEMP
   :type: int

   Gets the FLIR Lepton FPA temp in Celsius. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_AUX_TEMP
   :type: int

   Gets the FLIR Lepton AUX temp in Celsius. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_SET_MODE
   :type: int

   Sets the FLIR Lepton driver into a mode where each pixel is a temperature value. See
   `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_MODE
   :type: int

   Returns whether measurement mode is enabled for the FLIR Lepton sensor. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_SET_RANGE
   :type: int

   Sets the temperature range mapped to pixel values in measurement mode. See `CSI.ioctl`.

.. data:: IOCTL_LEPTON_GET_RANGE
   :type: int

   Returns the temperature range used for measurement mode. See `CSI.ioctl`.

.. data:: IOCTL_HIMAX_MD_ENABLE
   :type: int

   Controls the motion detection interrupt on the HM01B0. See `CSI.ioctl`.

.. data:: IOCTL_HIMAX_MD_WINDOW
   :type: int

   Sets the motion detection window on the HM01B0. See `CSI.ioctl`.

.. data:: IOCTL_HIMAX_MD_THRESHOLD
   :type: int

   Sets the motion detection threshold on the HM01B0. See `CSI.ioctl`.

.. data:: IOCTL_HIMAX_MD_CLEAR
   :type: int

   Clears the motion detection interrupt on the HM01B0. See `CSI.ioctl`.

.. data:: IOCTL_HIMAX_OSC_ENABLE
   :type: int

   Controls the internal oscillator on the HM01B0. See `CSI.ioctl`.

.. data:: IOCTL_GET_RGB_STATS
   :type: int

   Returns the RGB statistics from the camera sensor. See `CSI.ioctl`.

.. data:: IOCTL_GENX320_SET_BIASES
   :type: int

   Sets the GENX320 sensor biases to a preset. See `CSI.ioctl`.

.. data:: GENX320_BIASES_DEFAULT
   :type: int

   Default biases for the GENX320 camera sensor.

.. data:: GENX320_BIASES_LOW_LIGHT
   :type: int

   Low light biases for the GENX320 camera sensor.

.. data:: GENX320_BIASES_ACTIVE_MARKER
   :type: int

   Active marker biases for the GENX320 camera sensor.

.. data:: GENX320_BIASES_LOW_NOISE
   :type: int

   Low noise biases for the GENX320 camera sensor.

.. data:: GENX320_BIASES_HIGH_SPEED
   :type: int

   High speed biases for the GENX320 camera sensor.

.. data:: IOCTL_GENX320_SET_BIAS
   :type: int

   Sets a single GENX320 camera sensor bias. See `CSI.ioctl`.

.. data:: GENX320_BIAS_DIFF_OFF
   :type: int

   Selects the GENX320 DIFF OFF bias.

.. data:: GENX320_BIAS_DIFF_ON
   :type: int

   Selects the GENX320 DIFF ON bias.

.. data:: GENX320_BIAS_FO
   :type: int

   Selects the GENX320 FO bias.

.. data:: GENX320_BIAS_HPF
   :type: int

   Selects the GENX320 HPF bias.

.. data:: GENX320_BIAS_REFR
   :type: int

   Selects the GENX320 REFR bias.

.. data:: IOCTL_GENX320_SET_AFK
   :type: int

   Sets the GENX320 anti-flicker filter. See `CSI.ioctl`.

.. data:: IOCTL_GENX320_SET_STC
   :type: int

   Sets the GENX320 spatio-temporal contrast filter mode. See `CSI.ioctl`.

.. data:: GENX320_STC_DISABLE
   :type: int

   Disable the GENX320 STC/trail filter.

.. data:: GENX320_STC_ONLY
   :type: int

   Enable only the spatio-temporal contrast filter on the GENX320.

.. data:: GENX320_STC_TRAIL_ONLY
   :type: int

   Enable only the trail filter on the GENX320.

.. data:: GENX320_STC_TRAIL
   :type: int

   Enable both the STC and trail filters on the GENX320.

.. data:: IOCTL_GENX320_SET_MODE
   :type: int

   Sets the GENX320 camera sensor operating mode. See `CSI.ioctl`.

.. data:: GENX320_MODE_HISTO
   :type: int

   Sets the GENX320 to histogram mode.

.. data:: GENX320_MODE_EVENT
   :type: int

   Sets the GENX320 to event mode.

.. data:: IOCTL_GENX320_READ_EVENTS
   :type: int

   Populates an ndarray with event information from the GENX320. See `CSI.ioctl`.

.. data:: IOCTL_GENX320_CALIBRATE
   :type: int

   Automatically turns off hot pixels on the GENX320. See `CSI.ioctl`.

.. data:: IOCTL_GENX320_READ_EVENTS_RAW
   :type: int

   Returns a raw event-frame `image.Image` from the GENX320. See `CSI.ioctl`.

.. data:: PIX_OFF_EVENT
   :type: int

   Pixel-off event.

.. data:: PIX_ON_EVENT
   :type: int

   Pixel-on event.

.. data:: RST_TRIGGER_RISING
   :type: int

   Pixel reset rising-edge event.

.. data:: RST_TRIGGER_FALLING
   :type: int

   Pixel reset falling-edge event.

.. data:: EXT_TRIGGER_RISING
   :type: int

   External trigger rising-edge event.

.. data:: EXT_TRIGGER_FALLING
   :type: int

   External trigger falling-edge event.
