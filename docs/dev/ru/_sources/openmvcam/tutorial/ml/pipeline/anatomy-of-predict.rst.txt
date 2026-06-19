Anatomy of predict
==================

:meth:`Model.predict(inputs, *, callback=None) <ml.Model.predict>`
is where the loaded model object actually does work. Between the
inputs going in and the result coming out, three stages run in
sequence: *pre-process*, *engine dispatch*, *post-process*. Two of
the three take parameters the script controls directly; the engine
in the middle is decided by the cam.

.. figure:: ../figures/predict-pipeline.svg
   :alt: A horizontal flow of five connected boxes from left to
         right. The leftmost is "Image input"; an arrow leads to
         "Pre-process" subtitled "Normalization"; an arrow leads to
         "Engine" subtitled "TFLM / STAI"; an arrow leads to
         "Post-process" subtitled "postprocess="; and a final
         arrow leads to "Result". The three middle stages carry a
         tag underneath -- "user-controllable" beneath Pre-process,
         "automatic" beneath Engine, and "user-controllable"
         beneath Post-process.

   The three stages of :meth:`~ml.Model.predict`. Pre-process and
   post-process take parameters the script controls; the engine in
   the middle is fixed by the cam.

Pre-process
-----------

The pre-process stage turns each input into the dense tensor the
network expects. The most common input is an :class:`image.Image`,
captured in RGB565. The stage crops and resizes it to the network's
:attr:`~ml.Model.input_shape`, converts from RGB565 to the channel
format the network was trained on (RGB888 for most vision networks),
applies per-channel scale and offset, and -- when the network
expects integer input -- quantizes to the model's
:attr:`~ml.Model.input_dtype` in the same pass. Networks trained for
float input skip the quantization step and receive the
scale-and-offset result directly.

The default :class:`ml.preprocessing.Normalization` reads the
model's input dtype and runs the right transformation
automatically. A hand-tuned :class:`Normalization` overrides the
scale, mean, and stdev values for models trained against custom
channel statistics (the ImageNet-derived means and standard
deviations are a common case). A plain callable overrides the stage
entirely -- useful when the input is not an image at all or when
the application has already produced the dense tensor itself.

Engine dispatch
---------------

The engine stage runs the network. Which engine it dispatches to is
fixed by the cam: the H7 and RT1062 run *TFLM* (the TensorFlow Lite
for Microcontrollers interpreter, dispatching ARM-optimised
*CMSIS-NN* kernels where they exist); the AE3 runs the same TFLM
interpreter with its Cortex-M55 fallback and the *Ethos-U* NPU
handling any operator the offline Vela compiler tagged for the
accelerator; the N6 runs *STAI*, ST's runtime for the N6's
purpose-built NPU.

The script does not pick the engine. The engine that ships with the
cam runs every model the cam loads.

Post-process
------------

The post-process stage turns the network's raw output tensors back
into a usable result. The default behaviour is to dequantize each
output tensor to floating point (or pass it through unchanged for
networks with float outputs) and return them as a list of
:class:`~ulab.numpy.ndarray` objects. Most applications register a
*post-processor* -- a callable that knows the network's output
layout -- to decode the tensors into the result form the
application acts on: a list of bounding boxes, a list of keypoints,
a list of classes.

The script controls this stage in two ways. The ``postprocess=``
keyword on the constructor registers a post-processor that runs on
every call. The ``callback=`` keyword on
:meth:`~ml.Model.predict` overrides the registered post-processor
for one call only -- useful for switching between several decoders
without re-loading the model. Either form receives ``(model,
inputs, outputs)`` and returns whatever the application expects.

What the script controls
------------------------

Pre-process and post-process are the script's two handles. The
default pre-processor handles most vision models; the right
post-processor for a given network family is picked from the
catalogue under :mod:`ml.postprocessing`. The engine in the middle
is decided by the build and runs the same way regardless of what
the script asks for.
