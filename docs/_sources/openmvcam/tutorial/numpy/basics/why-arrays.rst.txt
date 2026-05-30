Why arrays
==========

The :class:`~image.Image` class is the right tool for
pixel work because every method on it operates directly
on the camera's native pixel buffer in a single fast
call. Most of what the application does to a frame --
thresholding, blob finding, AprilTag detection, edge
filters -- already lives there.

What the image library does *not* expose is the rest of
the numerical work an OpenMV application runs into:

* sensor buffers that are not pixels -- ADC samples, IMU
  axes, microphone audio,
* derived numbers from the image that no built-in method
  returns -- a histogram column, a custom blend of two
  frames, a per-pixel transform the catalogue does not
  cover,
* small linear algebra -- the calibration matrix that
  rectifies the lens, the rotation that fuses the IMU,
* signal-processing math -- the FFT of a vibration
  buffer, an IIR filter applied to a sensor's output, a
  spectrogram a classifier wants as input.

All of these want the same shape: a buffer of numbers
with one operation applied to every element. A Python
``for`` loop is the obvious way to write it::

    for i in range(len(samples)):
        samples[i] = samples[i] * cal

The loop works. It is also slow. Python is an interpreted
language, and every iteration of a Python loop carries
the cost of running the interpreter once: look up
``samples``, read element ``i``, multiply, write back,
advance the loop counter, check the loop condition. On a
buffer of a thousand sensor samples those interpreter
costs add up to tens of milliseconds for what is
fundamentally a quick operation.

That overhead bites every time a script reaches a buffer.
A QVGA grayscale frame is 76 800 pixels; an
accelerometer at 100 Hz delivers a hundred three-axis
samples a second; a microphone fills a 1024-sample
buffer every 64 ms. A pure-Python ``for`` loop over any
of those turns a job that should take a few microseconds
into one that takes tens of milliseconds.

Library functions are faster than loops
---------------------------------------

The fix is to express the operation as a single function
call against the whole buffer, instead of a Python loop
over its elements. :mod:`numpy` is exactly that: a
library of array math where every operation is one
already-optimised function that walks the buffer once
from start to finish. ``np.multiply(samples, cal)``
multiplies every element of ``samples`` by ``cal``
inside a single call -- the same arithmetic the loop did,
without the per-iteration interpreter cost. The same
1000-element multiply that took tens of milliseconds as
a Python loop takes tens of microseconds as a numpy
call.

This is the deal :mod:`numpy` offers across the board:
sum, mean, sin, exp, matrix multiply, FFT, IIR filter --
each one is a single library function that operates on a
whole buffer at once. The trade is that the data has to
live in numpy's array type and the operation has to be
expressed against that array, not against its elements
one at a time.

Why a list will not do
----------------------

A Python :class:`list` cannot stand in. A list can hold
any mix of objects -- integers, floats, strings, other
lists -- so each element of a list of "1000 sensor
samples" is actually a separate ``int`` object stored
elsewhere, with the list keeping a reference to it. A
library function looking at a list would still have to
unpack each element through that reference and check its
type -- exactly the cost the loop pays. Lists are the
wrong shape for fast array math.

Why bytearray is not enough either
----------------------------------

A :class:`bytearray` is the right *shape* -- one
typed buffer, one byte per element, all in one
contiguous block. It is what most byte-oriented
peripheral APIs hand back. What it lacks is the *math*.
``bytearray * 2`` repeats the buffer rather than
doubling each value, and there is no sensible meaning
for ``bytearray + bytearray`` element by element.

The data structure that combines a typed buffer with
element-wise math is the :class:`~ulab.numpy.ndarray`.
The next page opens the box.
