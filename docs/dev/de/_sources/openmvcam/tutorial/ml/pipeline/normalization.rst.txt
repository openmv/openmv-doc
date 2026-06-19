Normalization
=============

:meth:`ml.Model.predict` takes a *list* of inputs because some
networks have more than one input tensor, but the list has no way
to carry per-input arguments inline -- there is no kwarg slot for
"crop *this* input to ``(x, y, w, h)`` but leave the other inputs
alone". :class:`ml.preprocessing.Normalization` is the wrapper that
fills that gap. A :class:`Normalization` instance holds the
parameters for one input; the script passes the wrapped input in
the predict list whenever it needs anything other than the defaults.

The most common reason to reach for it is to crop a specific region
of the captured frame into the network instead of the whole image.

Parameters
----------

::

    Normalization(scale=(0.0, 1.0),
                  mean=(0.0, 0.0, 0.0),
                  stdev=(1.0, 1.0, 1.0),
                  roi=None)

* ``roi`` -- ``(x, y, w, h)`` rectangle in the source frame to crop
  before resizing. Defaults to the whole frame. Most uses of
  :class:`Normalization` set just this parameter.
* ``scale`` -- the ``(min, max)`` range floating-point input tensors
  expect after normalization. The pixel range ``0..255`` is mapped
  linearly into this range. Common values are ``(0.0, 1.0)`` for
  ReLU-trained networks and ``(-1.0, 1.0)`` for symmetrically-
  normalised networks.
* ``mean`` -- per-channel ``(R, G, B)`` mean subtracted from the
  image after scaling. Matches the channel statistics the network
  was trained against -- ``(0.485, 0.456, 0.406)`` for
  ImageNet-derived networks is the canonical example. Grayscale
  networks reduce the mean to a luma value using the standard
  ``0.299*R + 0.587*G + 0.114*B``.
* ``stdev`` -- per-channel ``(R, G, B)`` standard deviation the
  image is divided by after the mean is subtracted, again matching
  the network's training statistics. Reduced to luma the same way
  for grayscale networks.

When parameters matter
----------------------

``scale``, ``mean``, and ``stdev`` are ignored when the network's
:attr:`~ml.Model.input_dtype` is ``int8`` or ``uint8``. For
integer-input networks the cropped image bytes are written into the
tensor directly and the network's own
:attr:`~ml.Model.input_scale` and
:attr:`~ml.Model.input_zero_point` handle the int-to-real
conversion. The three parameters matter only when the network
expects floating-point input.

``roi`` is read in every case -- it controls which part of the
source frame reaches the network regardless of the input dtype.

ROI and resize
--------------

The ROI is bilinearly scaled from its source dimensions to the
network's input dimensions. The image is centred in the destination
and the scaling fills the destination -- it does not preserve
aspect ratio. A non-square ROI fed to a square network input comes
out horizontally or vertically stretched.

Whether the stretch matters depends on the network. Face detection
and landmark models like the MediaPipe family (BlazeFace,
FaceLandmarks, HandLandmarks, MoveNet) were trained against square
crops and degrade quickly when the input aspect ratio is off; for
those, the application needs to give them a square ROI -- either by
capturing at a square framesize through :meth:`~csi.CSI.window` or
by cropping with the ``roi=`` parameter. YOLO-family object
detectors are typically trained with augmentation that includes
random stretches and accept non-square ROIs without much accuracy
loss; passing the full captured frame straight in is usually fine.

When the network's input dimensions match the ROI exactly the scale
collapses to a copy, which is the cheapest case.

Overriding the default
----------------------

:meth:`~ml.Model.predict` wraps each :class:`image.Image` input
with ``Normalization()`` automatically -- the default parameters
above. Most models that ship with the cam were trained against
pixel ranges the defaults already cover, so the common case is to
pass the image directly::

    result = model.predict([img])

To use a custom ROI -- the most common override -- build a
:class:`Normalization` with the ROI set and bind the image to it::

    from ml.preprocessing import Normalization

    norm = Normalization(roi=(80, 60, 160, 120))
    result = model.predict([norm(img)])

To match a network's training-time channel statistics, set the
floating-point parameters::

    norm = Normalization(scale=(0.0, 1.0),
                         mean=(0.485, 0.456, 0.406),
                         stdev=(0.229, 0.224, 0.225))

    result = model.predict([norm(img)])

Calling the :class:`Normalization` instance on the image returns a
new bound instance the engine fills the tensor from. The bound
instance is what predict accepts in place of the raw image, and
because it is a per-input object, a multi-input network can mix
images with different ROIs in the same predict list.

For networks that expect inputs the application has already
produced in tensor form -- a buffer from a peripheral, an
:class:`~ulab.numpy.ndarray` computed by another pipeline,
non-image numeric data -- skip :class:`Normalization` entirely and
pass the ndarray or a callable that produces it. :meth:`~ml.Model.predict`
passes those through to the engine without wrapping.
