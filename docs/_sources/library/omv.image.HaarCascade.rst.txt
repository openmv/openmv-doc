.. currentmodule:: image

class HaarCascade -- Feature Descriptor
=======================================

The Haar Cascade feature descriptor is an opaque handle used by
`Image.find_features()` to run Viola-Jones object detection on an image. It
holds the multi-stage classifier produced by training a Haar feature cascade
(for example, the built-in ``"frontalface"`` and ``"eye"`` cascades, or a
binary cascade file loaded from disk).

Cascade objects are created via the `image.HaarCascade()` factory function;
there is no public constructor. Once created, the cascade is passed directly
to `Image.find_features()` and the same cascade may be reused across many
frames.

The underlying class is ``Cascade``. Its ``repr()`` shows the window size and
the number of stages, features, and rectangles in the cascade, e.g.::

    >>> print(image.HaarCascade("frontalface"))
    {"width":25, "height":25, "n_stages":25, "n_features":2913, "n_rectangles":6383}

.. class:: Cascade

   Opaque cascade handle returned by `image.HaarCascade()`. The instance has
   no public methods or attributes -- it can only be passed to
   `Image.find_features()`.
