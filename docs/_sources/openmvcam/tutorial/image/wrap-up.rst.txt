Wrap up
=======

The image module is the largest API the cam
exposes, and the chapter just covered the
outline of it: how an image is represented in
memory, how the camera reads and writes
individual pixels, how it draws into
captured frames, how it transforms them
arithmetically and geometrically, how it
threshold-classifies and filters them,
how it extracts measurements and detections
from them, how it decodes printed symbols
out of them, how it compares one image
against another, and how it gets the
results on and off the cam.

The toolkit is broad on purpose. A
classical computer-vision pipeline running
on a small embedded camera does most of
its work *before* anything reaches a
machine-learning model, when there is
one -- thresholding cleans up the input,
filters denoise, regions narrow the
search, blob and line detectors localise
candidates, similarity scoring decides
whether the candidate is interesting, and
the I/O layer hands the result to whatever
runs the next stage. Each page in this
chapter covered one of those operations;
the right pipeline for any given
application is a sequence of them
composed in the order the problem
demands.

The pipeline pattern
--------------------

Most non-trivial cam applications follow
the same outline. *Capture* a frame from
the sensor. *Pre-process* it: convert
formats, equalise the histogram, blur out
noise. *Localise* the regions or features
of interest: blob detection, line
detection, template matching, code
decoding. *Analyse* what was found:
geometric measurements, similarity
scoring, statistics. *Decide* what to do
based on the analysis: trigger a GPIO,
report a payload, capture-and-log, hand
the frame to an ML model. *Output* the
decision or the captured artefact: save,
encode, send, draw back into the frame
for the IDE preview.

No single chapter page covered every
step; the chapter covered the *building
blocks* the pipeline composes. Choosing
which blocks to use and in what order is
the work of the application script.

Where the chapter leads
-----------------------

The image module deals with images
*as images* -- pixels, regions, drawing,
detections. Plenty of work on captured
data does not fit that framing. Computing
statistics over an arbitrary numeric
array, running vectorised arithmetic on
raw sensor data, applying a custom
matrix transform that does not have an
image-module method behind it,
preparing data for a machine-learning
model that wants a specific tensor
layout -- all of those are jobs for a
numeric-array library, not an
image-processing one.

The next chapter covers exactly that.
The :mod:`ulab.numpy` module supplied
with MicroPython on the cam is a subset
of NumPy that operates on the same
memory the image module does: an
:class:`Image` can be handed to a
:mod:`ulab.numpy` routine as the
backing array, and a
:mod:`ulab.numpy` result can be
rendered back through
:meth:`~image.Image.to_bitmap` or
:meth:`~image.Image.to_rgb565` for
display. The two modules compose --
each does what the other does not, and
together they cover the numeric and
imaging work an embedded-vision
application needs.

