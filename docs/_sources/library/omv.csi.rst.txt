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
====================================

The `CSI` class is used to control a camera sensor.

Constructors
------------

.. class:: csi.CSI(cid=-1, delays=True, fflush=True, fb_size=2097152)

   Create an object to talk with a camera sensor. On camera sensor modules with multiple sensors,
   the particular CSI object may be selected by passing a ``cid`` like `csi.LEPTON` to select a
   FLIR Lepton sensor module. If ``cid`` is -1 then the primary sensor is selected (typically a
   color camera module on multi-sensor boards).

   If ``delays`` is ``False`` then disable all settling time delays in the csi driver.
   Whenever you reset the camera module, change modes, etc. the sensor driver delays to prevent
   you can from calling `CSI.snapshot` to quickly afterwards and receiving corrupt frames from the
   camera module. By disabling delays you can quickly update the camera module settings in bulk
   via multiple method calls before delaying at the end and calling `CSI.snapshot`.

   If ``fflush`` is ``False`` then automatic framebuffer flushing mentioned in `CSI.framebuffers`
   is disabled. This removes any time limit on frames in the frame buffer fifo. For example, if
   you set the number of frame buffers to 30 and set the frame rate to 30 you can now precisely
   record 1 second of video from the camera without risk of frame loss.

   .. note::

      `CSI.snapshot` starts the frame capture process which will continue to capture frames until
      there is no space to hold a frame at which point the frame capture process stops. The
      process always stops when there is no space to hold the next frame.

   Methods
   -------

   .. method:: reset(hard:bool=True) -> None

      Initializes the camera sensor. Performs a hardware reset by toggling the RESET signal GPIO
      to the camera module if ``hard`` is ``True``. ``hard`` should be set to false when resetting auxiliary
      camera sensors that share the same RESET signal GPIO as the primary module.

   .. method:: shutdown(enable:bool) -> None

      Puts the camera into a lower power mode than sleep (but the camera must be reset on being woken up).

   .. method:: sleep(enable:bool) -> None

      Puts the camera to sleep if enable is True. Otherwise, wakes it back up.

   .. method:: flush() -> None

      Copies whatever was in the frame buffer to the IDE. You should call this
      method to display the last image your OpenMV Cam takes if it's not running
      a script with an infinite loop. Note that you'll need to add a delay time
      of about a second after your script finishes for the IDE to grab the image
      from your camera. Otherwise, this method will have no effect.

   .. method:: snapshot(time=-1, frames=-1, update=True, blocking=True, image=None) -> Optional[image.Image]

      Takes a picture using the camera and returns an `Image` object.

      If ``time`` and/or ``frames`` is passed snapshot will block for that many ``time`` milliseconds
      and/or ``frames`` captured from the camera. Both arguments may be used at the same time.
      After ``time`` and/or ``frames`` has passed ``CSI.snapshot`` will return ``None``.

      ``update`` controls if `CSI.flush` is called internally before capturing the next snapshot
      so that the previous frame buffer is sent to the IDE.

      ``blocking`` may be ``False`` to enable non-blocking behavior which will cause snapshot to
      return ``None`` when the next image from the camera is not ready versus waiting.

      ``image`` may be another `Image` object to update with the new image captured from the camera
      instead of returning an `Image` object. Note that this does a deep copy update of the provided
      image.

      If `CSI.auto_rotation()` is enabled this method will return a new
      already rotated `Image` object.

   .. method:: width() -> int

      Returns the sensor resolution width.

   .. method:: height() -> int

      Returns the sensor resolution height.

   .. method:: cid() -> int

      Returns the camera module ID.

         * `csi.OV2640`: Second gen OpenMV Cam sensor - never released.
         * `csi.OV5640`: High-res OpenMV Cam H7 Plus sensor.
         * `csi.OV7670`: Arduino Giga Sensor Module.
         * `csi.OV7690`: OpenMV Cam Micro sensor module.
         * `csi.OV7725`: Rolling shutter sensor module.
         * `csi.OV9650`: First gen OpenMV Cam sensor - never released.
         * `csi.MT9V022`: Global shutter sensor module.
         * `csi.MT9V024`: Global shutter sensor module.
         * `csi.MT9V032`: Global shutter sensor module.
         * `csi.MT9V034`: Global shutter sensor module.
         * `csi.MT9M114`: OV7725 replacement rolling shutter sensor module.
         * `csi.BOSON320`: Boson 320x256 thermal sensor module.
         * `csi.BOSON640`: Boson 640x512 thermal sensor module.
         * `csi.LEPTON`: Lepton1/2/3 sensor module.
         * `csi.HM01B0`: Arduino Portenta H7 sensor module.
         * `csi.HM0360`: Arduino Portenta H7 sensor module.
         * `csi.GC2145`: Arduino Nicla Vision H7 sensor module.
         * `csi.GENX320ES`: Prophesee Event Camera sensor module (engineering sample).
         * `csi.GENX320`: Prophesee Event Camera sensor module.
         * `csi.PAG7920`: PixArt Imaging sensor Module.
         * `csi.PAG7936`: PixArt Imaging sensor Module.
         * `csi.PAJ6100`: PixArt Imaging sensor Module.
         * `csi.PSS5520`: PixArt Imaging sensor Module. 
         * `csi.FROGEYE2020` : FrogEye2020 event camera sensor module - never released.

   .. method:: readable() -> bool

      Returns if there's an image ready to be returned by `CSI.snapshot` so that any call
      to snapshot will not block.

   .. method:: pixformat(pixformat:Optional[int]) -> Optional[int]

      Sets the pixel format for the camera module.

         * `csi.GRAYSCALE`: 8-bits per pixel.
         * `csi.RGB565`: 16-bits per pixel.
         * `csi.BAYER`: 8-bits per pixel bayer pattern.
         * `csi.YUV422`: 16-bits per pixel (8-bits Y1, 8-bits U, 8-bits Y2, 8-bits V, etc.)
         * `csi.JPEG`: Compressed JPEG data. Only for the OV2640/OV5640.

      If you are trying to take JPEG images with the OV2640 or OV5640 camera modules at high
      resolutions you should set the pixformat to `csi.JPEG`. You can control the image
      quality then with `CSI.quality()`.

      Returns the current pixformat if called with no arguments.

   .. method:: framesize(framesize:Optional[int]) -> Optional[int]

      Sets the frame size for the camera module.

         * `csi.QCIF`: 176x144
         * `csi.CIF`: 352x288
         * `csi.QSIF`: 176x120
         * `csi.SIF`: 352x240
         * `csi.QQQVGA`: 80x60
         * `csi.QQVGA`: 160x120
         * `csi.QVGA`: 320x240
         * `csi.VGA`: 640x480
         * `csi.HQVGA`: 240x160
         * `csi.HVGA`: 480x320
         * `csi.WVGA`: 720x480 (for the MT9V034)
         * `csi.WVGA2`:752x480 (for the MT9V034)
         * `csi.SVGA`: 800x600 (only for the OV2640/OV5640 sensor)
         * `csi.XGA`: 1024x768 (only for the OV2640/OV5640 sensor)
         * `csi.WXGA`: 1280x768 (for the MT9M114)
         * `csi.SXGA`: 1280x1024 (only for the OV2640/OV5640 sensor)
         * `csi.SXGAM`: 1280x960 (for the MT9M114)
         * `csi.UXGA`: 1600x1200 (only for the OV2640/OV5640 sensor)
         * `csi.HD`: 1280x720 (only for the OV2640/OV5640 sensor)
         * `csi.FHD`: 1920x1080 (only for the OV5640/PSS520 sensor)
         * `csi.QHD`: 2560x1440 (only for the OV5640 sensor)
         * `csi.QXGA`: 2048x1536 (only for the OV5640 sensor)
         * `csi.WQXGA`: 2560x1600 (only for the OV5640 sensor)
         * `csi.WQXGA2`: 2592x1944 (only for the OV5640 sensor)

      Alternatively, you may pass a custom framesize like ``framesize((320, 320))``. Note that when
      `CSI.snapshot` is called the custom framesize will be evaluated against DMA rules if it's valid.
      Generally, framesizes need to be a multiple of 8 pixels and or 16 bytes.

      Returns the current framesize if called with no arguments.

   .. method:: framerate(rate:Optional[int]) -> Optional[int]

      Sets the frame rate in hz for the camera module.

      Returns the current framerate if called with no arguments.

      .. note::

         `CSI.framerate` works by dropping frames received by the camera module to keep the frame rate
         equal to (or below) the rate you specify. By default the camera will run at the maximum frame
         rate. If implemented for the particular camera sensor then `CSI.framerate` will also reduce
         the camera sensor frame rate internally to save power and improve image quality by increasing
         the sensor exposure. `CSI.framerate` may conflict with `CSI.auto_exposure` on some cameras.

   .. method:: window(roi:Union[Tuple[int,int],Tuple[int,int,int,int]]) -> Tuple[int,int,int,int]

      Sets the resolution of the camera to a sub resolution inside of the current
      resolution. For example, setting the resolution to `csi.VGA` and then
      the windowing to (120, 140, 200, 200) sets `CSI.snapshot()` to capture
      the 200x200 center pixels of the VGA resolution outputted by the camera
      sensor. You can use windowing to get custom resolutions. Also, when using
      windowing on a larger resolution you effectively are digital zooming.

      ``roi`` is a rect tuple (x, y, w, h). However, you may just pass (w, h) and
      the ``roi`` will be centered on the frame. You may also pass roi not in parens.

      Returns the current ``roi`` rect tuple (x, y, w, h) if called with no arguments.

   .. method:: gainceiling(gainceiling:Optional[int]) -> Optional[int]

      Set the camera image gainceiling. 2, 4, 8, 16, 32, 64, or 128.

      Returns the current gainceiling if called with no arguments.

   .. method:: set_brightness(brightness:Optional[int]) -> Optional[int]

      Set the camera image brightness.

      Returns the current brightness if called with no arguments.

   .. method:: contrast(contrast:Optional[int]) -> Optional[int]

      Set the camera image contrast.

      Returns the current contrast if called with no arguments.

   .. method:: saturation(saturation:Optional[int]) -> Optional[int]

      Set the camera image saturation.

      Returns the current saturation if called with no arguments.

   .. method:: quality(quality:Optional[int]) -> Optional[int]

      Set the camera image JPEG compression quality. 0 - 100.

      Returns the current quality if called with no arguments.

      .. note::

         Only for the OV2640/OV5640 cameras.

   .. method:: colorbar(enable:Optional[bool]) -> Optional[bool]

      Turns color bar mode on (True) or off (False). Defaults to off.

      Returns the current setting if called with no arguments.

   .. method:: auto_gain(enable:bool, gain_db=None, gain_db_ceiling:Optional[float]=None) -> None

      ``enable`` turns auto gain control on (True) or off (False).
      The camera will startup with auto gain control on.

      If ``enable`` is False you may set a fixed gain in decibels with ``gain_db``.

      If ``enable`` is True you may set the maximum gain ceiling in decibels with
      ``gain_db_ceiling`` for the automatic gain control algorithm.

      .. note::

         You need to turn off white balance too if you want to track colors.

   .. method:: gain_db() -> float

      Returns the current camera gain value in decibels (float).

   .. method:: auto_exposure(enable:bool, exposure_us:Optional[int]=None) -> None

      ``enable`` turns auto exposure control on (True) or off (False).
      The camera will startup with auto exposure control on.

      If ``enable`` is False you may set a fixed exposure time in microseconds
      with ``exposure_us``.

      .. note::

         Camera auto exposure algorithms are pretty conservative about how much
         they adjust the exposure value by and will generally avoid changing the
         exposure value by much. Instead, they change the gain value a lot to deal
         with changing lighting.

   .. method:: exposure_us() -> int

      Returns the current camera exposure value in microseconds (int).

   .. method:: auto_whitebal(enable:bool, rgb_gain_db:Optional[Tuple[float,float,float]]=None) -> None

      ``enable`` turns auto white balance on (True) or off (False).
      The camera will startup with auto white balance on.

      If ``enable`` is False you may set a fixed gain in decibels for the red, green,
      and blue channels respectively with ``rgb_gain_db``.

      .. note::

         You need to turn off gain control too if you want to track colors.

   .. method:: rgb_gain_db() -> Tuple[float, float, float]

      Returns a tuple with the current camera red, green, and blue gain values in
      decibels ((float, float, float)).

   .. method:: auto_blc(enable:bool, regs:Optional[Any]=None)

      Sets the auto black line calibration (blc) control on the camera.

      ``enable`` pass `True` or `False` to turn BLC on or off. You typically always want this on.

      ``regs`` if disabled then you can manually set the blc register values via the values you
      got previously from `CSI.blc_regs()`.

   .. method:: blc_regs() -> Any

      Returns the sensor blc registers as an opaque tuple of integers. For use with `CSI.auto_blc`.

   .. method:: hmirror(enable:Optional[bool]) -> None

      Turns horizontal mirror mode on (True) or off (False). Defaults to off.

      Returns the current setting if called with no arguments.

   .. method:: vflip(enable:Optional[bool]) -> None

      Turns vertical flip mode on (True) or off (False). Defaults to off.

      Returns the current setting if called with no arguments.

   .. method:: transpose(enable:Optional[bool]) -> None

      Turns transpose mode on (True) or off (False). Defaults to off.

         * vflip=False, hmirror=False, transpose=False -> 0 degree rotation
         * vflip=True,  hmirror=False, transpose=True  -> 90 degree rotation
         * vflip=True,  hmirror=True,  transpose=False -> 180 degree rotation
         * vflip=False, hmirror=True,  transpose=True  -> 270 degree rotation

      Returns the current setting if called with no arguments.

   .. method:: auto_rotation(enable:Optional[bool]) -> None

      Turns auto rotation mode on (True) or off (False). Defaults to off.

      Returns the current setting if called with no arguments.

      .. note::

         This method only works when the OpenMV Cam has an `imu` installed and is enabled automatically.

   .. method:: framebuffers(count:Optional[int], expand:Optional[bool]) -> Optional[int]

      Sets the number of frame buffers used to receive image data. By default your OpenMV Cam will
      automatically try to allocate the maximum number of frame buffers it can possibly allocate to
      ensure the best performance. Automatic reallocation of frame buffers occurs whenever you
      call `CSI.pixformat()`, `CSI.framesize()`, and `CSI.window()`.

      `CSI.snapshot()` will automatically handle switching active frame buffers in the background.
      From your code's perspective there is only ever 1 active frame buffer even though there might
      be more than 1 frame buffer on the system and another frame buffer receiving data in the background.

      If count is:

         1 - Single Buffer Mode
            In single buffer mode your OpenMV Cam will allocate one frame buffer for receiving images.
            When you call `CSI.snapshot()` that framebuffer will be used to receive the image and
            the camera driver will continue to run. In the advent you call `CSI.snapshot()` again
            before the first line of the next frame is received your code will execute at the frame rate
            of the camera. Otherwise, the image will be dropped.

         2 - Double Buffer Mode
            In double buffer mode your OpenMV Cam will allocate two frame buffers for receiving images.
            When you call `CSI.snapshot()` one framebuffer will be used to receive the image and
            the camera driver will continue to run. When the next frame is received it will be stored
            in the other frame buffer. In the advent you call `CSI.snapshot()` again
            before the first line of the next frame after is received your code will execute at the frame rate
            of the camera. Otherwise, the image will be dropped.

         3 - Triple Buffer Mode
            In triple buffer mode your OpenMV Cam will allocate three buffers for receiving images.
            In this mode there is always a frame buffer to store the received image to in the background
            resulting in the highest performance and lowest latency for reading the latest received frame.
            No frames are ever dropped in this mode. The next frame read by `CSI.snapshot()` is the
            last captured frame by the sensor driver (e.g. if you are reading slower than the camera
            frame rate then the older frame in the possible frames available is skipped).

      Regarding the reallocation above, triple buffering is tried first, then double buffering, and then
      single buffering.

      You may pass a value of 4 or greater to put the sensor driver into video FIFO mode where received
      images are stored in a frame buffer FIFO with ``count`` buffers. This is useful for video recording
      to an SD card which may randomly block your code from writing data when the SD card is performing
      house-keeping tasks like pre-erasing blocks to write data to.

      ``expand`` allows for allocating more memory in each frame buffer than required for the framebuffer
      framesize and pixformat when set to ``True``. This is useful to allow for modifications of the `Image`
      in the framebuffer in-place versus things like `Image.scale()` requiring a new allocation.

      .. note::

         On frame drop (no buffers available to receive the next frame) all frame buffers are automatically
         cleared except the active frame buffer. This is done to ensure `CSI.snapshot()` returns current
         frames and not frames from long ago.

      Fun fact, you can pass a value of 100 or so on OpenMV Cam's with SDRAM for a huge video fifo. If
      you then call snapshot slower than the camera frame rate (by adding `machine.sleep()`) you'll get
      slow-mo effects in OpenMV IDE. However, you will also see the above policy effect of resetting
      the frame buffer on a frame drop to ensure that frames do not get too old. If you want to record
      slow-mo video just record video normally to the SD card and then play the video back on a desktop
      machine slower than it was recorded.

      Returns the current setting if called with no arguments.

   .. method:: special_effect(effect:int) -> bool

      ``effect`` Special digital effect value.

      Returns ``True`` on success and ``False`` on failure.

   .. method:: lens_correction(enable:bool, radi:int, coef:int) -> bool

      ``enable`` True to enable and False to disable (bool).
      ``radi`` integer radius of pixels to correct (int).
      ``coef`` power of correction (int).

      Returns ``True`` on success and ``False`` on failure.

   .. method:: vsync_callback(cb) -> None

      Registers callback ``cb`` to be executed (in interrupt context) whenever the camera module
      generates a new frame (but, before the frame is received).

      ``cb`` takes one argument and is passed the current state of the vsync pin after changing.

      Returns the callback if passed no arguments.

   .. method:: frame_callback(cb) -> None

      Registers callback ``cb`` to be executed (in interrupt context) whenever the camera module
      generates a new frame and the frame is ready to be read via `CSI.snapshot()`.

      ``cb`` takes no arguments.

      Use this to get an interrupt to schedule reading a frame later with `micropython.schedule()`.

      Returns the callback if passed no arguments.

   .. method:: ioctl(*args, **kwargs) -> Any

      Executes a sensor specific method:

      * `csi.IOCTL_SET_READOUT_WINDOW` - Pass this enum followed by a rect tuple (x, y, w, h) or a size tuple (w, h).
         * This IOCTL allows you to control the readout window of the camera sensor which dramatically improves the frame rate at the cost of field-of-view.
         * If you pass a rect tuple (x, y, w, h) the readout window will be positoned on that rect tuple. The rect tuple's x/y position will be adjusted so the size w/h fits. Additionally, the size w/h will be adjusted to not be smaller than the ``framesize``.
         * If you pass a size tuple (w, h) the readout window will be centered given the w/h. Additionally, the size w/h will be adjusted to not be smaller than the ``framesize``.
         * This IOCTL is extremely helpful for increasing the frame rate on higher resolution cameras like the OV2640/OV5640.
      * `csi.IOCTL_GET_READOUT_WINDOW` - Pass this enum for `CSI.ioctl` to return the current readout window rect tuple (x, y, w, h). By default this is (0, 0, maximum_camera_sensor_pixel_width, maximum_camera_sensor_pixel_height).
      * `csi.IOCTL_SET_TRIGGERED_MODE` - Pass this enum followed by True or False set triggered mode for the MT9V034 sensor.
      * `csi.IOCTL_GET_TRIGGERED_MODE` - Pass this enum for `CSI.ioctl` to return the current triggered mode state.
      * `csi.IOCTL_SET_FOV_WIDE` - Pass this enum followed by True or False enable `CSI.framesize()` to optimize for the field-of-view over FPS.
      * `csi.IOCTL_GET_FOV_WIDE` - Pass this enum for `CSI.ioctl` to return the current field-of-view over fps optimization state.
      * `csi.IOCTL_TRIGGER_AUTO_FOCUS` - Pass this enum for `CSI.ioctl` to trigger auto focus on the OV5640 FPC camera module.
      * `csi.IOCTL_PAUSE_AUTO_FOCUS` - Pass this enum for `CSI.ioctl` to pause auto focus (after triggering) on the OV5640 FPC camera module.
      * `csi.IOCTL_RESET_AUTO_FOCUS` - Pass this enum for `CSI.ioctl` to reset auto focus (after triggering) on the OV5640 FPC camera module.
      * `csi.IOCTL_WAIT_ON_AUTO_FOCUS` - Pass this enum for `CSI.ioctl` to wait for auto focus (after triggering) to finish on the OV5640 FPC camera module. You may pass a second argument of the timeout in milliseconds. The default is 5000 ms.
      * `csi.IOCTL_SET_NIGHT_MODE` - Pass this enum followed by True or False set nightmode the OV7725 and OV5640 sensors.
      * `csi.IOCTL_GET_NIGHT_MODE` - Pass this enum for `CSI.ioctl` to return the current night mode state.
      * `csi.IOCTL_LEPTON_GET_WIDTH` - Pass this enum to get the FLIR Lepton image width in pixels.
      * `csi.IOCTL_LEPTON_GET_HEIGHT` - Pass this enum to get the FLIR Lepton image height in pixels.
      * `csi.IOCTL_LEPTON_GET_RADIOMETRY` - Pass this enum to get the FLIR Lepton type (radiometric or not).
      * `csi.IOCTL_LEPTON_GET_REFRESH` - Pass this enum to get the FLIR Lepton refresh rate in hertz.
      * `csi.IOCTL_LEPTON_GET_RESOLUTION` - Pass this enum to get the FLIR Lepton ADC resolution in bits.
      * `csi.IOCTL_LEPTON_RUN_COMMAND` - Pass this enum to execute a FLIR Lepton SDK command. You need to pass an additional 16-bit value after the enum as the command to execute.
      * `csi.IOCTL_LEPTON_SET_ATTRIBUTE` - Pass this enum to set a FLIR Lepton SDK attribute.
         * The first argument is the 16-bit attribute ID to set (set the FLIR Lepton SDK).
         * The second argument is a MicroPython byte array of bytes to write (should be a multiple of 16-bits). Create the byte array using ``struct`` following the FLIR Lepton SDK.
      * `csi.IOCTL_LEPTON_GET_ATTRIBUTE` - Pass this enum to get a FLIR Lepton SDK attribute.
         * The first argument is the 16-bit attribute ID to set (set the FLIR Lepton SDK).
         * Returns a MicroPython byte array of the attribute. Use ``struct`` to deserialize the byte array following the FLIR Lepton SDK.
      * `csi.IOCTL_LEPTON_GET_FPA_TEMP` - Pass this enum to get the FLIR Lepton FPA Temp in celsius.
      * `csi.IOCTL_LEPTON_GET_AUX_TEMP` - Pass this enum to get the FLIR Lepton AUX Temp in celsius.
      * `csi.IOCTL_LEPTON_SET_MODE` - Pass this followed by True or False to turn off automatic gain control on the FLIR Lepton and force it to output an image where each pixel value represents an exact temperature value in celsius. A second True enables high temperature mode enabling measurements up to 500C on the Lepton 3.5, False is the default low temperature mode.
      * `csi.IOCTL_LEPTON_GET_MODE` - Pass this to get a tuple for (measurement-mode-enabled, high-temp-enabled).
      * `csi.IOCTL_LEPTON_SET_RANGE` - Pass this when measurement mode is enabled to set the temperature range in celsius for the mapping operation. The temperature image returned by the FLIR Lepton will then be clamped between these min and max values and then scaled to values between 0 to 255. To map a pixel value back to a temperature (on a grayscale image) do: ((pixel * (max_temp_in_celsius - min_temp_in_celsius)) / 255.0) + min_temp_in_celsius.
         * The first arugment should be the min temperature in celsius.
         * The second argument should be the max temperature in celsius. If the arguments are reversed the library will automatically swap them for you.
      * `csi.IOCTL_LEPTON_GET_RANGE` - Pass this to return the sorted (min, max) 2 value temperature range tuple. The default is -10C to 40C if not set yet.
      * `csi.IOCTL_HIMAX_MD_ENABLE` - Pass this enum followed by ``True``/``False`` to enable/disable motion detection on the HM01B0. You should also enable the I/O pin (PC15 on the Arduino Portenta) attached the HM01B0 motion detection line to receive an interrupt.
      * `csi.IOCTL_HIMAX_MD_CLEAR` - Pass this enum to clear the motion detection interrupt on the HM01B0.
      * `csi.IOCTL_HIMAX_MD_WINDOW` - Pass this enum followed by (x1, y1, x2, y2) to set the motion detection window on the HM01B0.
      * `csi.IOCTL_HIMAX_MD_THRESHOLD` - Pass this enum followed by a threshold value (0-255) to set the motion detection threshold on the HM01B0.
      * `csi.IOCTL_HIMAX_OSC_ENABLE` - Pass this enum followed by ``True``/``False`` to enable/disable the oscillator HM01B0 to save power.
      * `csi.IOCTL_RGB_STATS` - Pass this enum to get the RGB statistics from the camera sensor. Returns a tuple of (r, gb, gr, b) values.
      * `csi.IOCTL_GENX320_SET_BIASES` - Pass this enum followed by a bias enum to set the GENX320 sensor biases.
      * `csi.IOCTL_GENX320_SET_BIAS` - Pass this enum followed by a bias enum and a bias value to set the GENX320 sensor bias.
      * `csi.IOCTL_GENX320_SET_AFK` - Pass this enum followed by ``enable``, ``freq_low_in_hz``, ``freq_high_in_hz`` to change the GENX320 anti-flickering-filter settings.
      * `csi.IOCTL_GENX320_SET_MODE` - Pass this enum followed by a ``GENX320_MODE`` to change the camera operating mode. For event mode, you must additionally pass the length of the row axis of the event ``ndarray``.
      * `csi.IOCTL_GENX320_READ_EVENTS` - Populates a passed uint16 ``ndarray`` with post-processed events from the camera.
         * Shape: (EVT_res, 6) where EVT_res is the event resolution
         * EVT_res: must be a power of two between 1024 and 65536.
         * Columns:
         *   [0]  Event type (PIX_ON/OFF, TRIGGER, etc.)
         *   [1]  Seconds timestamp
         *   [2]  Milliseconds timestamp
         *   [3]  Microseconds timestamp
         *   [4]  X coordinate 0 to 319 for GENX320
         *   [5]  Y coordinate 0 to 319 for GENX320
      * `csi.IOCTL_GENX320_CALIBRATE` - Pass this enum followed by a sigma floating point value to turn off pixel values out of sigma standard deviation from the normal distribution on the GENX320 camera module.

   .. method:: color_palette(palette:Optional[int]) -> Optional[int]

      Sets the color palette to use for things like FLIR Lepton grayscale to RGB565 conversion.

      Returns the current setting if called with no arguments.

   .. method:: __write_reg(address:int, value:int) -> None

      Write ``value`` (int) to camera register at ``address`` (int).

      .. note:: See the camera data sheet for register info.

   .. method:: __read_reg(address:int) -> int

      Read camera register at ``address`` (int).

      .. note:: See the camera data sheet for register info.

Functions
---------

.. function:: devices() -> List[int]

   Returns of list of the detected sensor chip IDs.

Constants
---------

.. data:: BINARY
   :type: int

   BINARY (bitmap) pixel format. Each pixel is 1-bit.

   This format is usful for mask storage. Can be used with `Image()`.

.. data:: GRAYSCALE
   :type: int

   GRAYSCALE pixel format (Y from YUV422). Each pixel is 8-bits, 1-byte.

   All of our computer vision algorithms run faster on grayscale images than
   RGB565 images.

.. data:: RGB565
   :type: int

   RGB565 pixel format. Each pixel is 16-bits, 2-bytes. 5-bits are used for red,
   6-bits are used for green, and 5-bits are used for blue.

   All of our computer vision algorithms run slower on RGB565 images than
   grayscale images.

.. data:: BAYER
   :type: int

   RAW BAYER image pixel format. If you try to make the frame size too big
   to fit in the frame buffer your OpenMV Cam will set the pixel format
   to BAYER so that you can capture images but only some image processing methods
   will be operational.

.. data:: YUV422
   :type: int

   A pixel format that is very easy to jpeg compress. Each pixel is stored as a grayscale
   8-bit Y value followed by alternating 8-bit U/V color values that are shared between two
   Y values (8-bits Y1, 8-bits U, 8-bits Y2, 8-bits V, etc.). Only some image processing
   methods work with YUV422.

.. data:: JPEG
   :type: int

   JPEG mode. The camera module outputs compressed jpeg images.
   Use `CSI.quality()` to control the jpeg quality.
   Only works for the OV2640/OV5640 cameras.

.. data:: OV2640
   :type: int

   `CSI.cid()` returns this for the OV2640 camera.

.. data:: OV5640
   :type: int

   `CSI.cid()` returns this for the OV5640 camera.

.. data:: OV7670
   :type: int

   `CSI.cid()` returns this for the OV7670 camera.

.. data:: OV7690
   :type: int

   `CSI.cid()` returns this for the OV7690 camera.

.. data:: OV7725
   :type: int

   `CSI.cid()` returns this for the OV7725 camera.

.. data:: OV9650
   :type: int

   `CSI.cid()` returns this for the OV9650 camera.

.. data:: MT9V022
   :type: int

   `CSI.cid()` returns this for the MT9V022 camera.

.. data:: MT9V024
   :type: int

   `CSI.cid()` returns this for the MT9V024 camera.

.. data:: MT9V032
   :type: int

   `CSI.cid()` returns this for the MT9V032 camera.

.. data:: MT9V034
   :type: int

   `CSI.cid()` returns this for the MT9V034 camera.

.. data:: MT9M114
   :type: int

   `CSI.cid()` returns this for the MT9M114 camera.

.. data:: BOSON320
   :type: int

   `CSI.cid()` returns this for the BOSON 320x256 camera.

.. data:: BOSON640
   :type: int

   `CSI.cid()` returns this for the BOSON 640x512 camera.

.. data:: LEPTON
   :type: int

   `CSI.cid()` returns this for the LEPTON1/2/3 cameras.

.. data:: HM01B0
   :type: int

   `CSI.cid()` returns this for the HM01B0 camera.

.. data:: HM0360
   :type: int

   `CSI.cid()` returns this for the HM0360 camera.

.. data:: GC2145
   :type: int

   `CSI.cid()` returns this for the GC2145 camera.

.. data:: GENX320ES
   :type: int

   `CSI.cid()` returns this for the GENX320 (Engineering Samples) camera.

.. data:: GENX320
   :type: int

   `CSI.cid()` returns this for the GENX320 camera.

.. data:: PAG7920
   :type: int

   `CSI.cid()` returns this for the PAG7920 camera.

.. data:: PAG7936
   :type: int

   `CSI.cid()` returns this for the PAG7936 camera.

.. data:: PSS5520
   :type: int

   `CSI.cid()` returns this for the PS5520 camera.

.. data:: PAJ6100
   :type: int

   `CSI.cid()` returns this for the PAJ6100 camera.

.. data:: FROGEYE2020
   :type: int

   `CSI.cid()` returns this for the FROGEYE2020 camera.

.. data:: SOFTCSI
   :type: int

   `CSI.cid()` returns this for the software CSI camera.

.. data:: NORMAL
   :type: int

   Set normal mode for `CSI.special_effect`.

.. data:: NEGATIVE
   :type: int

   Set negative mode for `CSI.special_effect`.

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

   1920x1080 resolution for the camera sensor. Only works for the OV5640 and PS5520 camera.

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

   Lets you set the readout window for the OV5640.

.. data:: IOCTL_GET_READOUT_WINDOW
   :type: int

   Lets you get the readout window for the OV5640.

.. data:: IOCTL_SET_TRIGGERED_MODE
   :type: int

   Lets you set the triggered mode for the MT9V034.

.. data:: IOCTL_GET_TRIGGERED_MODE
   :type: int

   Lets you get the triggered mode for the MT9V034.

.. data:: IOCTL_SET_FOV_WIDE
   :type: int

   Enable `CSI.framesize()` to optimize for the field-of-view over FPS.

.. data:: IOCTL_GET_FOV_WIDE
   :type: int

   Return if `CSI.framesize()` is optimizing for field-of-view over FPS.

.. data:: IOCTL_TRIGGER_AUTO_FOCUS
   :type: int

   Used to trigger auto focus for the OV5640 FPC camera module.

.. data:: IOCTL_PAUSE_AUTO_FOCUS
   :type: int

   Used to pause auto focus (while running) for the OV5640 FPC camera module.

.. data:: IOCTL_RESET_AUTO_FOCUS
   :type: int

   Used to reset auto focus back to the default for the OV5640 FPC camera module.

.. data:: IOCTL_WAIT_ON_AUTO_FOCUS
   :type: int

   Used to wait on auto focus to finish after being triggered for the OV5640 FPC camera module.

.. data:: IOCTL_SET_NIGHT_MODE
   :type: int

   Used to turn night mode on or off on a sensor. Nightmode reduces the frame rate to increase exposure dynamically.

.. data:: IOCTL_GET_NIGHT_MODE
   :type: int

   Gets the current value of if night mode is enabled or disabled for your sensor.

.. data:: IOCTL_LEPTON_GET_WIDTH
   :type: int

   Lets you get the FLIR Lepton image resolution width in pixels.

.. data:: IOCTL_LEPTON_GET_HEIGHT
   :type: int

   Lets you get the FLIR Lepton image resolution height in pixels.

.. data:: IOCTL_LEPTON_GET_RADIOMETRY
   :type: int

   Lets you get the FLIR Lepton type (radiometric or not).

.. data:: IOCTL_LEPTON_GET_REFRESH
   :type: int

   Lets you get the FLIR Lepton refresh rate in hertz.

.. data:: IOCTL_LEPTON_GET_RESOLUTION
   :type: int

   Lets you get the FLIR Lepton ADC resolution in bits.

.. data:: IOCTL_LEPTON_RUN_COMMAND
   :type: int

   Executes a 16-bit command given the FLIR Lepton SDK.

.. data:: IOCTL_LEPTON_SET_ATTRIBUTE
   :type: int

   Sets a FLIR Lepton Attribute given the FLIR Lepton SDK.

.. data:: IOCTL_LEPTON_GET_ATTRIBUTE
   :type: int

   Gets a FLIR Lepton Attribute given the FLIR Lepton SDK.

.. data:: IOCTL_LEPTON_GET_FPA_TEMP
   :type: int

   Gets the FLIR Lepton FPA temp in celsius.

.. data:: IOCTL_LEPTON_GET_AUX_TEMP
   :type: int

   Gets the FLIR Lepton AUX temp in celsius.

.. data:: IOCTL_LEPTON_SET_MODE
   :type: int

   Lets you set the FLIR Lepton driver into a mode where you can get a valid temperature value per pixel. See `CSI.ioctl()` for more information.

.. data:: IOCTL_LEPTON_GET_MODE
   :type: int

   Lets you get if measurement mode is enabled or not for the FLIR Lepton sensor. See `CSI.ioctl()` for more information.

.. data:: IOCTL_LEPTON_SET_RANGE
   :type: int

   Lets you set the temperature range you want to map pixels in the image to when in measurement mode. See `CSI.ioctl()` for more information.

.. data:: IOCTL_LEPTON_GET_RANGE
   :type: int

   Lets you get the temperature range used for measurement mode. See `CSI.ioctl()` for more information.

.. data:: IOCTL_HIMAX_MD_ENABLE
   :type: int

   Lets you control the motion detection interrupt on the HM01B0. See `CSI.ioctl()` for more information.

.. data:: IOCTL_HIMAX_MD_WINDOW
   :type: int

   Lets you control the motion detection interrupt on the HM01B0. See `CSI.ioctl()` for more information.

.. data:: IOCTL_HIMAX_MD_THRESHOLD
   :type: int

   Lets you control the motion detection interrupt on the HM01B0. See `CSI.ioctl()` for more information.

.. data:: IOCTL_HIMAX_MD_CLEAR
   :type: int

   Lets you control the motion detection interrupt on the HM01B0. See `CSI.ioctl()` for more information.

.. data:: IOCTL_HIMAX_OSC_ENABLE
   :type: int

   Lets you control the internal oscillator on the HM01B0. See `CSI.ioctl()` for more information.

.. data:: IOCTL_RGB_STATS
   :type: int

   Lets you get the RGB statistics from the camera sensor. See `CSI.ioctl()` for more information.

.. data:: IOCTL_GENX320_SET_BIASES
   :type: int

   Lets you set the GENX320 camera sensor biases. See `CSI.ioctl()` for more information.

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

   Lets you set a single GENX320 camera sensor bias. See `CSI.ioctl()` for more information.

.. data:: GENX320_BIAS_DIFF_OFF
   :type: int

   Set the GENX320 DIFF OFF bias.

.. data:: GENX320_BIAS_DIFF_ON
   :type: int

   Set the GENX320 DIFF ON bias.

.. data:: GENX320_BIAS_FO
   :type: int

   Set the GENX320 FO bias.

.. data:: GENX320_BIAS_HPF
   :type: int

   Set the GENX320 HPF bias.

.. data:: ENX320_BIAS_REFR
   :type: int

   Set the GENX320 REFR bias.

.. data:: IOCTL_GENX320_SET_AFK
   :type: int

   Lets you set the GENX320 camera sensor anti-flickering-filter. See `CSI.ioctl()` for more information.

.. data:: IOCTL_GENX320_SET_MODE
   :type: int

   Lets you set the GENX320 camera sensor into event mode. See `CSI.ioctl()` for more information.

.. data:: GENX320_MODE_HISTO
   :type: int

   Sets the GENX320 to histogram mode. 

.. data:: GENX320_MODE_EVENT
   :type: int

   Sets the GENX320 to event mode. 

.. data:: IOCTL_GENX320_READ_EVENTS
   :type: int

   Populates an ndarray with event information. See `CSI.ioctl()` for more information.

.. data:: PIX_OFF_EVENT
   :type: int

   Pixel off event.

.. data:: PIX_ON_EVENT
   :type: int

   Pixel on event.

.. data:: RST_TRIGGER_RISING
   :type: int

   Pixel reset rising event.

.. data:: RST_TRIGGER_FAILING
   :type: int

   Pixel reset failing event.

.. data:: EXT_TRIGGER_RISING
   :type: int

   External trigger rising event.

.. data:: EXT_TRIGGER_FAILING
   :type: int

   External trigger failing event.

.. data:: IOCTL_GENX320_CALIBRATE

   Automatically turns off hot-pixels on the GENX320. See `CSI.ioctl()` for more information.
