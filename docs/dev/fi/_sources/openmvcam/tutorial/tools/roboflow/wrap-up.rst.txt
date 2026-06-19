Wrap up
=======

The whole path, end to end: record footage on the camera, upload
the clip and sample it into frames, label the frames with Auto Label
and a review pass, build a dataset version with sensible
augmentations, train a small YOLO-family detector on Roboflow's
servers, and download integer-quantized TFLite weights from the
OpenMV deploy target. The model then loads through the same
:doc:`ROMFS <../ide/romfs>` flow as any other.

One idea runs through all of it: train on what the camera will
actually see. Capture with the camera that will run the model,
augment for the variations it will meet, and train at a small
resolution that fits the hardware. A model built that way performs
on the camera the way it did in testing.
