Tensor I/O
==========

The engine accepts a single tensor on the input side and produces
one or more on the output side. The tensors are
:class:`~ulab.numpy.ndarray` objects with the shape, dtype, and
descriptor vocabulary the numpy chapter introduced. Their shapes
and dtypes come from the model file and are reported through
:attr:`~ml.Model.input_shape` / :attr:`~ml.Model.output_shape` and
:attr:`~ml.Model.input_dtype` / :attr:`~ml.Model.output_dtype`.

Quantization
------------

Most networks the cam runs operate on quantized integer tensors --
``int8`` or ``uint8`` -- to fit within the cam's RAM and compute
budget. A quantized tensor carries integer values that represent
real-valued numbers through a per-tensor scale and zero point:

.. math::

   \text{real} = \text{scale} \times (q - \text{zero_point})

.. math::

   q = \mathrm{round}(\text{real} / \text{scale}) + \text{zero_point}

The scale and zero point come from the model's training-time
calibration and are stored in the model file. They are exposed as
:attr:`~ml.Model.input_scale`,
:attr:`~ml.Model.input_zero_point`,
:attr:`~ml.Model.output_scale`, and
:attr:`~ml.Model.output_zero_point` -- each a list with one entry
per input or output tensor.

:func:`ml.utils.quantize` and :func:`ml.utils.dequantize` apply the
formulas against a specified output index::

    import ml.utils

    real_tensor = ml.utils.dequantize(model, q_tensor, index=0)
    q_tensor    = ml.utils.quantize(model, real_tensor, index=0)

Both functions return the value unchanged when the output dtype at
the given index is already float, so the call is safe regardless of
the model's quantization status.

What the script sees on the output side
---------------------------------------

What :meth:`~ml.Model.predict` returns depends on whether a
post-processor is registered.

With no post-processor, the engine's raw integer outputs are
*auto-dequantized* to float and returned as a list of float
:class:`~ulab.numpy.ndarray` objects. The script receives
real-valued numbers ready to read. This is the right path for
classification networks, whose single output tensor is already a
list of per-class confidence scores the application iterates over
-- no decoding step needed. It is also the easy path for getting
an unknown model running quickly or for ad-hoc inspection from the
REPL.

With a post-processor registered (through ``postprocess=`` on the
constructor or ``callback=`` on the predict call), the raw
quantized tensors are handed to the post-processor's callable
directly. The post-processor receives the raw quantized tensors
and is responsible for whatever dequantization it needs.

The split is a performance choice. Auto-dequantization allocates a
new float tensor for each output and walks every element. A
post-processor that only needs a few values from each tensor --
threshold the confidence scores, then decode boxes for the
survivors -- skips the cost of dequantizing the rest. The box
decoders shipped under :mod:`ml.postprocessing` all take this
route, and :func:`ml.utils.threshold` is built for exactly this
case: it takes a quantized score tensor and returns the indices
whose dequantized values pass a real-valued threshold, without
dequantizing the whole tensor.
