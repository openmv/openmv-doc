:mod:`ml` --- Machine Learning
==============================

.. module:: ml
   :synopsis: Machine Learning

The `ml` module contains functionality for loading and running TensorFlow Lite models on the
OpenMV Cam. The module exposes a single user-facing class, `ml.Model`, which wraps the underlying
C `Model` class with additional Python-side conveniences (automatic label loading and automatic
image-to-tensor conversion).

Sub Modules
-----------

.. toctree::
    :maxdepth: 2

    omv.ml.apps.rst
    omv.ml.preprocessing.rst
    omv.ml.postprocessing.rst

.. toctree::
    :maxdepth: 1

    omv.ml.utils.rst


class Model -- Model Container
------------------------------

.. class:: Model(path: str, postprocess: object = None) -> Model

   Loads a TensorFlow Lite model from ``path`` into memory and prepares it for inference. ``path``
   may be a file on the filesystem or the name of a model built into the firmware image.

   *postprocess* is an optional post-processing callable invoked by `Model.predict` after
   inference. It receives ``(model, inputs, outputs)`` and may return any value (e.g. a list of
   bounding boxes). When provided, the post-processor receives the raw model output tensors
   (un-dequantized) for performance.

   On construction, the wrapper additionally attempts to load a ``.txt`` file with the same base
   name as ``path``; if found, each line is loaded into `Model.labels`. Otherwise `Model.labels`
   is ``None``.

   .. method:: predict(inputs: list, *, callback: object = None) -> list

      Runs inference on the model and returns the output tensors.

      *inputs* is a list with one entry per model input tensor. Each entry may be:

         * An ``ndarray`` whose shape matches the corresponding entry in `Model.input_shape`. Values
           are quantized using the input tensor's scale and zero point (float32 inputs are passed
           through unchanged).
         * An ``image.Image`` object. The wrapper automatically wraps it in a
           `ml.preprocessing.Normalization` object to convert it to the expected tensor.
         * A callable. It will be invoked with ``(bytearray, shape, dtype)`` and is expected to fill
           the bytearray with the input tensor data.

      *callback* is an optional per-call post-processing callable. When supplied, it overrides
      the ``postprocess`` set on the constructor for this call only. The callback receives
      ``(model, inputs, outputs)`` and its return value is returned by `predict`.

      Returns a list of ``ndarray`` outputs, one per model output tensor. If no post-processor is
      active the outputs are dequantized to ``float32``; if a post-processor is active the raw
      output tensors (using each tensor's native dtype) are passed to it instead.

   .. attribute:: Model.len
      :type: int

      The size of the loaded model in bytes.

   .. attribute:: Model.ram
      :type: int

      The amount of RAM used by the model's tensor arena, in bytes.

   .. attribute:: Model.input_shape
      :type: list[tuple[int, ...]]

      A list of tuples giving the shape of each input tensor.

   .. attribute:: Model.input_dtype
      :type: list[str]

      A list of single-character strings giving the dtype of each input tensor:
      ``'b'`` (int8), ``'B'`` (uint8), ``'h'`` (int16), ``'H'`` (uint16), ``'f'`` (float32).

   .. attribute:: Model.input_scale
      :type: list[float]

      A list of floats giving the quantization scale of each input tensor.

   .. attribute:: Model.input_zero_point
      :type: list[int]

      A list of ints giving the quantization zero point of each input tensor.

   .. attribute:: Model.output_shape
      :type: list[tuple[int, ...]]

      A list of tuples giving the shape of each output tensor.

   .. attribute:: Model.output_dtype
      :type: list[str]

      A list of single-character strings giving the dtype of each output tensor:
      ``'b'`` (int8), ``'B'`` (uint8), ``'h'`` (int16), ``'H'`` (uint16), ``'f'`` (float32).

   .. attribute:: Model.output_scale
      :type: list[float]

      A list of floats giving the quantization scale of each output tensor.

   .. attribute:: Model.output_zero_point
      :type: list[int]

      A list of ints giving the quantization zero point of each output tensor.

   .. attribute:: Model.postprocess
      :type: object

      The post-processing callable supplied to the constructor, or ``None``.

   .. attribute:: Model.labels
      :type: list[str]

      List of label strings loaded from the ``.txt`` file alongside the model, or ``None`` if no such
      file exists.
