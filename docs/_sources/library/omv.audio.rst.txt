:mod:`audio` --- Audio Module
=============================

.. module:: audio
   :synopsis: Get audio samples.

The ``audio`` module is used to record audio samples from a microphone. PDM
samples captured from the microphone are filtered and decimated to PCM samples
which can be passed to a user callback or read directly into a buffer.

Functions
---------

.. function:: init(channels: int = 1, frequency: int = 16000, gain_db: int = 24, highpass: float | bool = 0.9883, samples: int = -1, buffers: int = 16, overflow: bool = True, clkdiv: int = 0) -> None

   Initializes the audio module. Must be called first before using the audio module.

   ``channels`` is the number of audio channels. May be ``1`` or ``2``. Audio samples
   are interleaved when more than one channel is used. Multi-channel capture is only
   supported on boards with more than one microphone.

   ``frequency`` is the PCM sample frequency in Hz. The set of supported frequencies
   is port/board specific.

   ``gain_db`` is the microphone gain to apply, in decibels.

   ``highpass`` is the high pass filter coefficient (STM32) or a boolean enabling the
   high pass filter (Alif). Ignored on ports that do not implement a high pass filter.

   ``samples`` is the number of PCM samples to accumulate per callback. If set to
   ``-1`` the value is computed automatically from the decimation factor and number
   of channels. Must be a multiple of 16. Available on the STM32 and Alif ports.

   ``buffers`` is the number of internal PCM buffers used to queue samples between
   the DMA ISR and the user. Available on the Alif and RP2 ports.

   ``overflow`` controls whether a buffer overflow raises ``RuntimeError``. When
   ``False`` the oldest buffer is overwritten and streaming continues. Available on
   the Alif and RP2 ports.

   ``clkdiv`` overrides the PIO clock divider used to drive the PDM clock. When ``0``
   the divider is computed from the requested frequency. Available on the RP2 port.

.. function:: start_streaming(callback: Callable[[bytearray], None] | None) -> None

   Starts audio capture.

   ``callback`` is called from the scheduler with a single argument ``pcmbuf`` each
   time a new PCM buffer is ready. ``pcmbuf`` is a signed 16-bit ``bytearray`` of
   PCM samples whose length is determined by the decimation factor, the number of
   channels and the ``samples`` argument passed to `audio.init()`. In single-channel
   mode each entry is one 16-bit sample; in dual-channel mode samples are interleaved
   in pairs.

   On ports that support `audio.get_buffer()` (Alif and RP2), passing a non-callable
   value (e.g. ``None``) starts capture without a callback so buffers can be drained
   with `audio.get_buffer()` instead.

.. function:: stop_streaming() -> None

   Stops audio capture and clears any installed callback.

.. function:: get_buffer(timeout: int = 0) -> bytearray

   Returns the next available PCM buffer. Blocks until a buffer is ready or until
   ``timeout`` milliseconds have elapsed (``0`` means wait forever). Raises
   ``RuntimeError`` if streaming is not enabled, if a buffer overflow has occurred
   while ``overflow`` is ``True``, or if a streaming callback is installed.

   Available on the Alif and RP2 ports.

.. function:: read_pdm(buf: bytearray) -> None

   Reads raw PDM samples from the microphone directly into ``buf``. ``buf`` must be
   an ``array``/``bytearray`` whose element size matches the number of channels
   (1 byte for mono, 2 bytes for stereo).

   Available on the STM32 port (SAI-based boards) only.

.. function:: samples() -> int

   Returns the total number of PCM samples captured since the last call to
   `audio.start_streaming()`.

   Available on the RP2 port only.

.. function:: overflow() -> bool

   Returns ``True`` if a buffer overflow has occurred since the last call to
   `audio.start_streaming()`.

   Available on the RP2 port only.
