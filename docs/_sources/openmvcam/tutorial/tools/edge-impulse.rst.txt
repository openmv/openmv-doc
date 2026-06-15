Edge Impulse
============

.. raw:: html

   <div class="framed-embed" style="position: relative; padding-bottom: 56.25%; height: 0;
               margin-bottom: 1.5rem; overflow: hidden; border-radius: 8px;">
     <iframe src="https://player.vimeo.com/video/832261155?title=0&amp;byline=0&amp;portrait=0"
             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
             allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
             title="Edge Impulse Product Overview"></iframe>
   </div>

`Edge Impulse <https://edgeimpulse.com/>`__ is an end-to-end
platform for building machine-learning models that run on
microcontrollers: collect and label data, design and train a model
in the browser, and have it optimized to fit a device measured in
kilobytes. It deploys straight to OpenMV -- a few clicks turn a
trained model into files ready to run on the camera. Edge Impulse's
own `documentation <https://docs.edgeimpulse.com/>`__ goes deeper on
every step.

Getting data in
---------------

A model performs best on the kind of images it was trained on, so
capture the dataset with the camera that will run it. The IDE's
:doc:`dataset editor <ide/dataset-editor>` is built for exactly
this -- create class folders, capture labelled images from the live
frame buffer, and then upload the dataset straight into an Edge
Impulse project from the Export submenu (log in to your account
there first). From that point on you work in Edge Impulse Studio.

.. seealso::

   Edge Impulse's own `OpenMV Cam setup guide
   <https://docs.edgeimpulse.com/hardware/boards/openmv-cam-h7-plus>`__
   for installing the tools and connecting the camera.

Training
--------

Training happens entirely in the browser: design an *impulse* (the
input, processing, and learning blocks), train it, and check the
accuracy on the held-out test data.

Two model types suit the camera. An image classifier outputs a list
of class scores, which you read straight off the model's output --
no post-processor needed. FOMO, a fast object detector designed for
microcontrollers, needs one decoding step, and the camera ships a
post-processor for it (:mod:`ml.postprocessing.edgeimpulse`), so
those models run with no extra code either.

Deploying to the camera
-----------------------

When training finishes, open the project's **Deployment** page,
pick the **OpenMV Library** target, and click *Build*. The download
is a zip holding the trained model (``trained.tflite``), its labels
(``labels.txt``), and an example script. The model is
integer-quantized. Edge Impulse covers this and the
custom-firmware alternative in its `run on OpenMV guide
<https://docs.edgeimpulse.com/hardware/deployments/run-openmv>`__.

Add the ``.tflite`` file to the camera with the IDE's :doc:`ROMFS
editor <ide/romfs>`, which converts it for the board's NPU when it
has one, and load it in a script with ``ml.Model``. Models also run
from the camera's flash drive -- copy the files over and point
``ml.Model`` at the path -- but ROMFS is the better home: models
there execute straight from flash without a RAM copy.

.. seealso::

   The :doc:`machine learning chapter <../ml/index>` for running
   models with the :mod:`ml` module -- loading, the inference
   pipeline, and decoding the output.
