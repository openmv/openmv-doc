Post-processors
===============

A detection network does not emit boxes. It emits one or more
tensors whose layout depends on the architecture the model was
trained against -- a 2-D tensor of candidate predictions for a
YOLO-family detector, a pair of ``(boxes, scores)`` tensors for a
MediaPipe detector, a flat list of keypoint coordinates for a pose
network. The application cannot read any of these directly; what
it wants -- a list of boxes, a list of keypoints, a per-class
breakdown -- has to be *decoded* out of the raw tensor.

That decoder is a *post-processor*. The :mod:`ml.postprocessing`
module groups them by source ecosystem.

Darknet
-------

:mod:`ml.postprocessing.darknet` decodes models from the original
YOLO era. YOLO v2 introduced the *grid* and *anchor* ideas most
later detectors inherited in some form, so the v2 layout is the
cleanest starting point.

YOLO v2 starts by dividing the input image into a coarse grid --
a 13-by-13 layout for the canonical 416-pixel input, smaller for
smaller models -- and trains the network so each grid cell is
responsible for detecting any object whose centre falls inside
it. The spatial layout of the output tensor mirrors the layout of
the input: one position in the output per cell in the image.

At each grid cell, the network does not predict a box out of thin
air. It picks from several pre-chosen reference shapes called
*anchors* -- fixed ``(width, height)`` pairs derived offline by
clustering the box sizes in the training set so they cover the
typical objects the model is expected to see. The network's job
at each cell is to predict, for each anchor, a small offset to
the box centre within the cell, a scale on the anchor's width and
height, an *objectness* score (the likelihood that anything is
there), and a per-class probability vector. A 13-by-13 grid with
the default 5 anchors and 20 classes therefore emits
``13 * 13 * 5 * (4 + 1 + 20) = 21,125`` numbers per inference.

:class:`~ml.postprocessing.darknet.YoloV2` decodes that layout:
it walks the cells, applies each anchor's offsets and scales to
recover absolute box coordinates, combines objectness with class
probability for a per-class score, thresholds, and pushes the
survivors to NMS. The class takes an ``anchors=`` constructor
argument when the model was trained against a custom anchor table
and falls back to a built-in default otherwise. Variants tuned
for specific class sets ship in the same submodule.

Ultralytics
-----------

:mod:`ml.postprocessing.ultralytics` decodes the newer YOLO
generations. :class:`~ml.postprocessing.ultralytics.YoloV8` reads
a column-major output where each column is one anchor prediction
holding box coordinates and a per-class score vector -- the
objectness channel earlier YOLO outputs carried has been dropped
in v8, and the class scores stand alone. The
:doc:`YOLOv8 walkthrough <yolov8-walkthrough>` steps through the
decode tensor-by-tensor. Older Ultralytics-era versions ship in
the same submodule for models trained against their layouts.

MediaPipe
---------

:mod:`ml.postprocessing.mediapipe` decodes Google's lightweight
on-device family. :class:`~ml.postprocessing.mediapipe.BlazeFace`
is the face detector covered in :doc:`hello-blazeface
<../foundations/hello-blazeface>`: a fast anchor-based detector
that emits boxes and six landmark coordinates per face, returned
as ``(box, score, keypoints)`` tuples with the landmarks attached
to each box rather than as a separate output list. Hand-detection,
landmark, and pose models from the same family ship alongside it
and follow the same attached-keypoint return shape.

Picking one
-----------

The right post-processor is determined by the architecture the
model was trained against, not by what the application wants. A
YOLOv8 ``.tflite`` only decodes correctly through
:class:`~ml.postprocessing.ultralytics.YoloV8`; a BlazeFace
``.tflite`` only through
:class:`~ml.postprocessing.mediapipe.BlazeFace`. Picking the
post-processor is part of picking the model. When a model's
architecture is not represented by a shipped post-processor,
:doc:`writing your own <writing-your-own>` is straightforward.

Classification networks are the exception. Their single output
tensor is already what the application wants -- a list of
per-class scores -- and no post-processor is needed. Loading the
model without ``postprocess=`` and reading the predict result as
a flat ndarray is the right path, as :doc:`tensor I/O
<../pipeline/tensor-io>` covered.
