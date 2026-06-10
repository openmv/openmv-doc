Recording and video tools
=========================

Recording the preview
---------------------

The *Record* button in the frame buffer pane's title
bar captures the preview to a video. While recording,
a readout under the image tracks the elapsed time, the
file size so far, and the recording frame rate; *Stop*
ends the capture and opens a save dialog. The format
follows the file extension typed into the save dialog
-- ``.mp4`` is the usual choice, every format the
bundled FFmpeg encoder supports works, and the OpenMV
``ImageReader`` ``.bin`` format produces a recording
that camera scripts can play back. On save the IDE
offers to rescale the video, and -- for ``.bin``
output -- to keep only every Nth frame.

What gets recorded is the preview: the recorder
samples the displayed frame at a fixed 30 FPS,
duplicating frames when the stream is slower and
dropping them when it is faster, annotations and all.
For a clean recording at the camera's real rate,
record on the camera itself with
:class:`image.ImageIO` or :mod:`mjpeg` instead -- the
IDE recorder is for demos and documentation, not data
collection.

Video tools
-----------

Tools → Video Tools wraps the bundled FFmpeg for the
file-handling jobs that surround camera work:

* *Convert Video File* -- transcode between formats.
  Both directions matter here: it converts the OpenMV
  ``ImageWriter`` / ``ImageReader`` ``.bin`` files that
  camera scripts record into ordinary MP4s, and it
  converts ordinary videos into ``.bin`` files a camera
  script can replay through :class:`image.ImageIO` --
  which is how a vision algorithm gets tested against
  recorded footage instead of a live scene. Rescaling
  is offered on every conversion (frame skipping when
  converting to ``.bin``), and selecting several
  source files converts them as a batch into a chosen
  folder. The file names pass straight through to
  FFmpeg, so its printf-style sequence patterns work:
  naming the output ``%07d.jpg`` splits a video into
  numbered stills, and naming the input the same way
  joins numbered stills into a video.
* *Play Video File* -- play any video file, including
  the camera's ``.bin`` recordings, without leaving the
  IDE. Copy recordings off the camera's drive first --
  reading large files over the camera's USB link is
  slow.
* *Play RTSP Stream* -- open a network video stream and
  display it. A camera on the same network running the
  :mod:`rtsp` library streams live video this way --
  the viewing side of the camera's network-video
  support.
