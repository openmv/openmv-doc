Wrap up
=======

The chapter walked through the parts of :mod:`ml` an OpenMV
application reaches for when an inference step is part of the
pipeline:

* **Concepts** -- what a neural network is in arithmetic terms
  (a stack of trainable operators that maps a tensor to a
  tensor), what machine learning changed compared to classical
  image processing (the human-written summary algorithm is
  gone, replaced by weights learned from labelled data), and
  the hello demo that ran a face detector in a handful of
  lines of Python.

* **The ml module** -- the :class:`ml.Model` object and its
  properties for inspecting input and output tensors, the
  model file paths it accepts, and where those files live: a
  read-only :doc:`ROMFS <ml-module/romfs>` partition for
  execution directly from flash, or any other MicroPython
  filesystem when the model can be copied into RAM at load
  time.

* **The inference pipeline** -- the three stages
  :meth:`~ml.Model.predict` runs in sequence (pre-process,
  engine dispatch, post-process), the
  :class:`~ml.preprocessing.Normalization` handle on stage
  one, the post-processor handle on stage three, and the
  quantization arithmetic that ties the integer tensors the
  cam runs back to the real-valued numbers the network was
  trained against.

* **Inference engines** -- TFLM (the operator interpreter
  most cams run), CMSIS-NN (the SIMD kernel library
  underneath it on Cortex-M), and the NPUs (Arm's Ethos-U55
  on the AE3 paired with the Vela offline compiler, ST's
  Neural-ART on the N6 paired with STAI and STEdgeAI). The
  engine is fixed by the cam; the script does not pick it.

* **Decoding the output** -- the post-processors that turn
  raw output tensors into boxes, keypoints, or per-class
  lists, the :class:`~ml.utils.NMS` class that collapses
  overlapping candidates, the YOLOv8 walkthrough that shows
  how to keep the decode fast by thresholding before
  dequantizing, and the protocol for writing a custom
  decoder when the catalogue does not cover a model.

What's now in reach
-------------------

Three things the chapter prepares for:

* **Loading a trained model and running it.** Anything in
  ``/rom/`` works without further preparation; anything
  supplied externally as a compatible ``.tflite`` works after
  the offline tool for the target cam (Vela for the AE3,
  STEdgeAI for the N6) has produced the right layout.

* **Decoding any output tensor.** When the architecture is in
  the catalogue, the right post-processor is mechanical:
  :class:`~ml.postprocessing.ultralytics.YoloV8` for a YOLOv8
  model, :class:`~ml.postprocessing.mediapipe.BlazeFace` for
  BlazeFace, and so on. When it is not, the
  :doc:`writing-your-own <postprocessing/writing-your-own>`
  protocol covers the contract and the
  :doc:`YOLOv8 walkthrough <postprocessing/yolov8-walkthrough>`
  is the cleanest reference to copy from.

* **Reasoning about performance.** A model that runs at 30
  FPS on an NPU may run at 3 FPS on a Cortex-M7; the ratio
  depends on how much of the network the cam can lift off
  the CPU. Quantization, ROMFS placement, NPU compilation,
  and the operator coverage of the target engine are the
  four levers, and the chapter covered each of them.

ML composes with the rest of the cam
------------------------------------

An inference rarely runs in isolation. The image module
captures and pre-processes the frame, the ml module runs the
network, and :mod:`ulab.numpy` does whatever numeric work
neither side has a built-in for. A typical detection script
combines all three: capture with :mod:`csi`, optionally
adjust the frame with :mod:`image`, run
:meth:`~ml.Model.predict`, post-process the result with the
right module out of :mod:`ml.postprocessing`, and reach for
:mod:`ulab.numpy` for any custom math the application wants
on top of the boxes the post-processor returned. The three
modules share the same memory model; the boundaries between
them are zero-copy wherever possible.
