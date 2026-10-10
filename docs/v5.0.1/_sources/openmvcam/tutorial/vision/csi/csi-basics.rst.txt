CSI basics
==========

The :mod:`csi` module is how Python code drives the camera
sensor. Every script that captures a frame follows the
same three-part shape: imports at the top, one-time
configuration in the middle, and a ``while True`` loop at
the bottom that pulls frames from the camera one at a
time.

The typical loop
----------------

::

    import csi, image, time

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.QVGA)

    clock = time.clock()
    while True:
        clock.tick()
        img = csi0.snapshot()
        # process img here
        print(clock.fps())

What each call does
-------------------

``import csi, image, time``
    Brings in three modules. :mod:`csi` controls the
    sensor, :mod:`image` defines the
    :class:`~image.Image` class that :meth:`~csi.CSI.snapshot`
    returns, and :mod:`time` provides the
    :func:`time.clock` helper used to measure frames per
    second.

``csi.CSI()``
    Constructs a :class:`~csi.CSI` instance that wraps
    one physical camera sensor. The constructor claims
    the camera peripheral and records the per-sensor
    configuration. Cameras with a single sensor have one
    :class:`~csi.CSI` instance; cameras with two sensors
    (colour plus thermal, colour plus event) have two,
    each selected by a ``cid`` argument to the
    constructor.

``csi0.reset()``
    Powers and configures the sensor. By default it
    pulses the sensor's reset pin, then writes the
    sensor's I2C registers to a known starting state.
    Subsequent configuration calls -- ``pixformat``,
    ``framesize``, the auto-control knobs -- push more
    register writes over the same I2C control bus.

``csi0.pixformat(csi.RGB565)``
    Writes the sensor registers that pick the output
    pixel format. The available choices are the formats
    the :doc:`pixel formats <../formats/pixel-formats>`
    page introduced: :data:`~csi.RGB565`,
    :data:`~csi.GRAYSCALE`, :data:`~csi.BAYER`,
    :data:`~csi.YUV422`, and :data:`~csi.JPEG` on the
    sensors that support it.

``csi0.framesize(csi.QVGA)``
    Writes the registers that pick the output resolution.
    :data:`~csi.QVGA` is 320 × 240; the named sizes run
    up to :data:`~csi.WQXGA2` (2592 × 1944, about 5 MP)
    on sensors that support them. A custom ``(width,
    height)`` tuple works too, as long as it lines up
    with the sensor's output capabilities.

``clock = time.clock()``
    Creates a clock helper. Each call to ``clock.tick()``
    inside the loop records the iteration start time;
    :meth:`time.clock.fps` reports the recent loop rate
    in frames per second.

``img = csi0.snapshot()``
    Captures one frame from the sensor and returns it as
    an :class:`~image.Image`. The mechanics of how that
    frame ends up in memory are worth a closer look.

How snapshot fills memory
-------------------------

The sensor delivers pixels on the pixel-data bus described
in :doc:`sensor buses <../sensor/data-bus>` at rates of
hundreds of megabytes per second -- far too fast for the
CPU to copy pixel by pixel in software.

Instead, the MCU offloads the transfer to *Direct Memory
Access* (DMA) -- a hardware engine separate from the CPU
that copies bytes from one place to another inside the
MCU without involving the CPU at all. The camera input
peripheral catches each incoming pixel byte into a small
on-chip FIFO; whichever ISP stages run on the MCU side
process the data on the way through; and the DMA engine
writes the finished pixels into a framebuffer in RAM at
the corresponding pixel offset. Nothing in that chain
needs the CPU once the DMA channel has been programmed.

When ``snapshot()`` is called:

1. The CSI driver programs the DMA engine with the
   framebuffer's address, the transfer length (one
   frame's worth of pixels), and a callback for the
   DMA-done interrupt.
2. The driver enables the camera input peripheral and
   waits for the sensor to signal the start of the next
   frame.
3. As the sensor streams the frame out, the peripheral
   hands each pixel byte through the ISP and on to the
   DMA engine, which writes the result into RAM at the
   next framebuffer offset. The CPU is free to run other
   code during the transfer.
4. When the last pixel of the frame arrives, the DMA
   fires its done interrupt, the driver wraps the
   framebuffer in an :class:`~image.Image`, and
   ``snapshot()`` returns it to user code.

The :class:`~image.Image` returned does not own a copy of
the pixel data -- it points at one of the camera's
framebuffers in RAM. How many framebuffers the camera
keeps, and how they get handed between the DMA and user
code on each call to :meth:`~csi.CSI.snapshot`, depends on
the buffering mode the application has selected through
:meth:`~csi.CSI.framebuffers`.
