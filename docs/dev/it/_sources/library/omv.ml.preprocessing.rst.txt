.. currentmodule:: ml.preprocessing

:mod:`ml.preprocessing` --- ML Preprocessing
============================================

.. module:: ml.preprocessing
    :synopsis: ML Preprocessing

The `ml.preprocessing` module contains classes for preprocessing images for use with
machine learning models.

.. _preprocessing.Normalization:

class Normalization -- Image Normalization
------------------------------------------

The `Normalization` object converts `image.Image` objects into ``ndarray`` input tensors
for use with `ml.Model.predict()`. It is automatically created by the `ml.Model` object
when an image is passed to `ml.Model.predict()`, but may be instantiated manually to
control the conversion (scale, mean/stdev, ROI).

.. class:: Normalization(scale: tuple[float, float] = (0.0, 1.0), mean: tuple[float, float, float] = (0.0, 0.0, 0.0), stdev: tuple[float, float, float] = (1.0, 1.0, 1.0), roi: tuple[int, int, int, int] = None)

   Creates a `Normalization` object.

   ``scale`` is the ``(min, max)`` range of values that floating-point input tensors
   expect after normalization (e.g. ``(0.0, 1.0)`` or ``(-1.0, 1.0)``). Ignored for
   ``uint8`` and ``int8`` input tensors.

   ``mean`` is the per-channel mean ``(R, G, B)`` subtracted from the image after
   scaling. For grayscale tensors the mean is reduced to a single luma value using
   ``0.299*R + 0.587*G + 0.114*B``. Ignored for ``uint8`` and ``int8`` input tensors.

   ``stdev`` is the per-channel standard deviation ``(R, G, B)`` the image is divided
   by after the mean is subtracted. For grayscale tensors the stdev is reduced to a
   single luma value using ``0.299*R + 0.587*G + 0.114*B``. Ignored for ``uint8`` and
   ``int8`` input tensors.

   ``roi`` is an optional ``(x, y, w, h)`` region of interest within the input image
   to crop. If ``None``, the full image is used. The cropped region is centered,
   bilinearly scaled (preserving aspect ratio with black padding) to the model's
   input tensor dimensions.

   .. method:: __call__(image: image.Image) -> Normalization
               __call__(buffer: bytearray, shape: tuple[int, int, int, int], dtype: int) -> None

      When called with a single `image.Image` argument, returns a new `Normalization`
      object bound to that image. The bound object is what `ml.Model.predict()` invokes
      internally to fill the input tensor. If ``roi`` was not set on the original
      instance, it is initialized to the full image size.

      When called with ``(buffer, shape, dtype)``, fills ``buffer`` in-place with the
      normalized input tensor for the previously bound image. ``shape`` must be
      ``(1, H, W, C)`` with ``C`` equal to ``1`` (grayscale) or ``3`` (RGB).
      ``dtype`` is the ulab numpy type code (e.g. ``ord('f')`` for float32, ``ord('b')``
      for int8, ``ord('B')`` for uint8). Float tensors apply ``scale``, ``mean``, and
      ``stdev``; integer tensors are written directly (with an offset for ``int8``).
