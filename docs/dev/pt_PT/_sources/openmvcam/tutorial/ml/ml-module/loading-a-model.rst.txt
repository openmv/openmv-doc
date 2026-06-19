Loading a model
===============

:class:`ml.Model` reads a model file from flash, parses it, allocates
the RAM the network needs during inference, and returns an object
that carries everything the rest of the script needs to know about
the loaded network.

The constructor
---------------

The constructor takes a path and an optional post-processor::

    model = ml.Model("/rom/blazeface_front_128.tflite",
                     postprocess=BlazeFace())

Models on ``/rom/`` (the flash-resident filesystem) are read in
place: the network's weights stay in flash and the loaded model
spends only the tensor arena's worth of RAM. Models on ``/sdcard/``
are copied into RAM at load time, so the total cost is model file
size plus tensor arena. Either path works; the trade-off is RAM.

If a sibling ``.txt`` file with the same basename exists, its
contents are loaded into :attr:`~ml.Model.labels` automatically.
The ``postprocess=`` keyword registers a callable that
:meth:`~ml.Model.predict` runs after each inference.

Read-only properties
--------------------

A loaded model exposes a small set of read-only properties that
describe the network without anyone running it.

*File and memory.*

* :attr:`~ml.Model.len` -- on-disk model file size, in bytes.
* :attr:`~ml.Model.ram` -- size of the *tensor arena* the network
  needs for its intermediate activations during inference, in bytes.

*Input tensors.*

* :attr:`~ml.Model.input_shape` -- a list of tuples, one per input
  tensor, giving the shape the network expects. Vision networks have
  one input with shape ``(1, H, W, C)``.
* :attr:`~ml.Model.input_dtype` -- list of single-character dtype
  codes (``'b'`` int8, ``'B'`` uint8, ``'h'`` int16, ``'H'`` uint16,
  ``'f'`` float32), one per input.
* :attr:`~ml.Model.input_scale` and
  :attr:`~ml.Model.input_zero_point` -- the *quantization
  parameters* that convert between the real-valued input the network
  was trained on and the integer representation the cam runs
  against.

*Output tensors.* Mirror of the input set:
:attr:`~ml.Model.output_shape`, :attr:`~ml.Model.output_dtype`,
:attr:`~ml.Model.output_scale`,
:attr:`~ml.Model.output_zero_point`. Detection networks produce two
or three output tensors (boxes, confidence scores, sometimes class
probabilities); classification networks produce one.

*Extras.* :attr:`~ml.Model.labels` is the class-name list loaded
from the sibling ``.txt`` file, or :data:`None`.
:attr:`~ml.Model.postprocess` is the registered post-processor, or
:data:`None`.

Inspecting BlazeFace
--------------------

Loading the shipped BlazeFace model and printing each property gives
the actual numbers::

    import ml
    from ml.postprocessing.mediapipe import BlazeFace

    model = ml.Model("/rom/blazeface_front_128.tflite",
                     postprocess=BlazeFace())

    print("file size:    ", model.len, "bytes")
    print("tensor arena: ", model.ram, "bytes")
    print("input shape:  ", model.input_shape)
    print("input dtype:  ", model.input_dtype)
    print("input scale:  ", model.input_scale)
    print("input zp:     ", model.input_zero_point)
    print("output shape: ", model.output_shape)
    print("output dtype: ", model.output_dtype)
    print("output scale: ", model.output_scale)
    print("output zp:    ", model.output_zero_point)

The numbers identify the network's interface concretely: a single
``(1, 128, 128, 3)`` ``int8`` input tensor and two ``int8`` outputs
-- one for box-regression coefficients, one for per-anchor
confidence scores. The quantization parameters describe how those
int8 values map to the real floats the network was trained against;
the post-processor uses them to undo the quantization before
decoding the boxes.

Every property is the single source of truth for what it describes.
Scripts read :attr:`~ml.Model.input_shape` to know what to capture
at, read :attr:`~ml.Model.output_scale` and
:attr:`~ml.Model.output_zero_point` to decode tensors by hand, and
read :attr:`~ml.Model.labels` for human-readable class names --
never hard-coded, never assumed.
