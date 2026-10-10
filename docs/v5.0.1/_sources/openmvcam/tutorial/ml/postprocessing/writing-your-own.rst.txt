Writing your own
================

When the catalogue does not cover a model -- a research network
whose output layout is bespoke, a tweak to an existing
architecture, a tensor whose semantic interpretation is
application-specific -- the application provides its own
post-processor. The protocol is plain: a callable that takes
``(model, inputs, outputs)`` and returns whatever the application
expects from :meth:`~ml.Model.predict`.

A class with ``__call__`` is the conventional form::

    class MyPostprocessor:
        def __init__(self, threshold=0.5):
            self.threshold = threshold

        def __call__(self, model, inputs, outputs):
            ...
            return result

A plain function works too -- the engine only checks that the
object is callable.

Hooking it in
-------------

Two attachment points. The ``postprocess=`` kwarg on the
constructor binds the callable for every
:meth:`~ml.Model.predict` call on the model::

    model = ml.Model("/rom/my_model.tflite",
                     postprocess=MyPostprocessor())

To override the binding for a single call -- swap decoders without
re-loading the model -- pass ``callback=`` to predict directly::

    result = model.predict([img], callback=MyOtherPostprocessor())

The callable signature is the same in either case.

What the callable receives
--------------------------

* ``model`` -- the :class:`~ml.Model` instance, useful for the
  quantization parameters
  (:attr:`~ml.Model.output_scale`,
  :attr:`~ml.Model.output_zero_point`,
  :attr:`~ml.Model.output_dtype`) and the input dimensions
  (:attr:`~ml.Model.input_shape`).
* ``inputs`` -- the list of inputs the application passed to
  :meth:`~ml.Model.predict`. The first element is usually the
  bound :class:`~ml.preprocessing.Normalization` instance; its
  ``roi`` attribute is what :class:`~ml.utils.NMS` expects for
  remapping boxes back into the original image.
* ``outputs`` -- the raw output tensors as a list of
  :class:`~ulab.numpy.ndarray` objects, in their native dtype.
  Float outputs arrive as-is; integer outputs arrive quantized.

Quantized arithmetic
--------------------

The shipped decoders all reach for the same helpers in
:mod:`ml.utils`, and a custom one usually wants the same pattern:
:func:`~ml.utils.quantize` lifts a float threshold into the
model's quantized space, :func:`~ml.utils.threshold` filters
without dequantizing the whole tensor, and
:func:`~ml.utils.dequantize` runs once on the survivors.
:func:`~ml.utils.sigmoid` and :func:`~ml.utils.logit` are
available for networks whose output channels are pre-sigmoid
logits (the MediaPipe detectors are the canonical case).

For models with float outputs -- regression heads, models with a
final dequantize layer baked in -- the quantization helpers pass
through unchanged, so the same post-processor code works against
either dtype without special-casing.

Return value
------------

Whatever the callable returns is what :meth:`~ml.Model.predict`
returns. For box-emitting decoders the convention is to push
candidates through an :class:`~ml.utils.NMS` and return its
per-class lists -- the call shape :doc:`non-max suppression
<non-max-suppression>` documents and the
:doc:`YOLOv8 walkthrough <yolov8-walkthrough>` builds in context.
For anything else, return whatever the application finds
convenient: a single :class:`~ulab.numpy.ndarray`, a label
string, a tuple of ``(class, score, embedding)``, a dictionary.
