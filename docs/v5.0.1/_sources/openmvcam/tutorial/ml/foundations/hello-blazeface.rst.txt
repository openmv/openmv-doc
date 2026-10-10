Hello BlazeFace
===============

*BlazeFace* is a face-detection neural network from Google's MediaPipe
collection. A single inference call returns a bounding rectangle
around each detected face along with six facial landmarks -- right
eye, left eye, nose, mouth, right ear, left ear. Every OpenMV Cam
that ships with neural-network support carries the
:data:`blazeface_front_128.tflite` model on flash, so running an
end-to-end face detector takes a few lines of Python.

The full script
---------------

::

    import csi
    import ml
    from ml.postprocessing.mediapipe import BlazeFace

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.VGA)
    csi0.window((400, 400))

    model = ml.Model("/rom/blazeface_front_128.tflite",
                     postprocess=BlazeFace(threshold=0.4))

    while True:
        img = csi0.snapshot()
        for (x, y, w, h), score, keypoints in model.predict([img]):
            img.draw_rectangle((x, y, w, h), color=(0, 255, 0))
            ml.utils.draw_keypoints(img, keypoints, color=(255, 0, 0))

That is the entire face detector. There is nothing else to it; the
script captures a frame, hands it to the model, walks the returned
list of detections, and draws each face's bounding rectangle plus its
six landmarks back into the frame. The IDE preview shows the boxes
and landmarks in real time.

What each line does
-------------------

The first three lines import the modules the script needs.
:mod:`csi` is the camera-sensor interface; :mod:`ml` is the
machine-learning module the rest of this chapter is about;
:class:`~ml.postprocessing.mediapipe.BlazeFace` is the post-processor
that turns BlazeFace's raw output tensors into the bounding-box and
landmark list the script iterates over.

The next five lines configure the sensor. The camera is reset to a
known state, set to RGB565 colour, set to VGA resolution, and then
*windowed* to a 400-by-400 square. The window matters: BlazeFace was
trained on square crops, and giving it a square input lines up the
network's expected aspect ratio with what it sees in the captured
frame.

The model-loading line opens the model file:

::

    model = ml.Model("/rom/blazeface_front_128.tflite",
                     postprocess=BlazeFace(threshold=0.4))

:class:`ml.Model` reads the file at the given path -- ``/rom/`` is a
flash-resident filesystem covered later -- and returns a model object
the script will run inferences against. The ``postprocess=`` keyword
registers the BlazeFace post-processor; without it, ``predict`` would
return the network's raw output tensors and the application would
have to decode them by hand. With it, ``predict`` returns the decoded
result directly. The ``threshold=0.4`` argument on the post-processor
sets the minimum confidence the network must report before a
detection is kept; lower values catch fainter faces at the cost of
more false positives.

The remaining four lines are the main loop. Each pass through it
captures one frame and asks the model what it sees:

::

    img = csi0.snapshot()
    for (x, y, w, h), score, keypoints in model.predict([img]):
        img.draw_rectangle((x, y, w, h), color=(0, 255, 0))
        ml.utils.draw_keypoints(img, keypoints, color=(255, 0, 0))

:meth:`~ml.Model.predict` takes a list of inputs (here, one captured
image) and returns a list of detection tuples. Each tuple holds the
bounding rectangle ``(x, y, w, h)``, a confidence ``score`` between
zero and one, and a ``(6, 2)`` :class:`~ulab.numpy.ndarray` of
landmark coordinates -- the right eye, left eye, nose, mouth, right
ear, and left ear in that order. The drawing call uses
:meth:`~image.Image.draw_rectangle` -- the same primitive every
classical detector in the image chapter ended with -- to outline
the face. :func:`ml.utils.draw_keypoints` is a small helper from
the ml utilities that marks each keypoint with a cross at its
``(x, y)`` position.

What the script does not say
----------------------------

The script is seven runnable lines of inference work past the imports
and the sensor setup, but a great deal of arithmetic happens inside
those seven lines. The captured 400-by-400 RGB565 frame becomes a
128-by-128 quantized 8-bit tensor before reaching the network; the
network runs hundreds of operations against tens of thousands of
weights; the resulting tensors of confidence scores and box offsets
become a ranked list of non-overlapping bounding boxes with attached
landmarks before ``predict`` returns. Every one of those
transformations is something the application *can* control if it
needs to, and several of them have to be tuned for any non-default
model.

The next four subsections walk those transformations open. In order:

* *The ml module* -- what :class:`ml.Model` exposes once a model is
  loaded, and where the model file actually lives on the cam.
* *The inference pipeline* -- the four stages of every
  :meth:`~ml.Model.predict` call.
* *Inference engines* -- the CPU and NPU paths that run the network's
  arithmetic.
* *Decoding the output* -- the post-processors that convert raw
  output tensors into the detections this script iterated over.

By the end of the chapter the reader can write the equivalent script
for a model that did not ship with the cam, decode a tensor whose
post-processor does not exist yet, and reason about why a particular
model runs at 30 FPS on one cam and 3 FPS on another.
