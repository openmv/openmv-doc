Machine Learning
================

Most detectors in the image chapter were hand-coded for a specific
target: hand-tuned colour ranges for blob tracking, hand-derived
weight patterns for edge filters, fixed geometric assumptions for the
line and circle finders. Each algorithm covered one kind of task, and
adding a new target meant writing a new algorithm. *Machine learning*
changes the workflow. Instead of one algorithm per target, the
application loads a *trained model* -- a stack of weights produced
off-board on a desktop with many example images -- and runs it on the
camera. The same engine that runs a face detector runs a hand-pose
estimator, a body-pose tracker, an object classifier, or whatever
else a model was trained for.

The :mod:`ml` module is the toolkit. Every operation builds on a
single :class:`Model` object that loads a model file from flash,
manages its quantized input and output tensors, dispatches each
inference to the right engine on the cam, and routes the resulting
tensors through an optional *post-processor* that converts them back
into the result form the application can act on -- boxes, keypoints,
classes, or whatever the model is for.

.. toctree::
   :caption: Concepts
   :maxdepth: 1

   foundations/what-is-a-neural-network.rst
   foundations/what-ml-changed.rst
   foundations/hello-blazeface.rst

.. toctree::
   :caption: The ml module
   :maxdepth: 1

   ml-module/loading-a-model.rst
   ml-module/romfs.rst

.. toctree::
   :caption: The inference pipeline
   :maxdepth: 1

   pipeline/anatomy-of-predict.rst
   pipeline/normalization.rst
   pipeline/tensor-io.rst

.. toctree::
   :caption: Inference engines
   :maxdepth: 1

   engines/tflm.rst
   engines/cmsis-nn.rst
   engines/npus.rst

.. toctree::
   :caption: Decoding the output
   :maxdepth: 1

   postprocessing/postprocessors.rst
   postprocessing/non-max-suppression.rst
   postprocessing/yolov8-walkthrough.rst
   postprocessing/writing-your-own.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
