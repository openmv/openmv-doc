The model zoo and NPU conversion
================================

The IDE ships with a library of pretrained
machine-learning models -- face detection, person
detection, object detection, pose estimation, and more
-- kept current through the IDE's resource updates.
Tools → Machine Vision → Open Model Zoo browses it:
select a model to see its description page alongside
the file tree, and tick the filter to narrow the list
to models that fit your board.

.. figure:: figures/model-zoo.png
   :alt: The Model Zoo browser: the model tree on the left with a model selected, its description page on the right, and the filter-by-board-type checkbox at the bottom

   The Model Zoo browser with a model selected and its
   description page open.

Choose a model and the IDE copies it out ready to run:
it converts the model for the target board's NPU
accelerator when the board has one, copies the matching
labels file alongside it, and defaults the destination
to the connected camera's drive. From there the script
side is one :class:`ml.Model` constructor call away. The same
browser is reachable from inside the :doc:`ROMFS editor
<romfs>`, which is the better destination for models on
boards that have ROMFS -- models in ROMFS execute
straight from flash without a RAM copy.

Converting other models
-----------------------

Tools → Machine Vision → Convert Model for NPU runs the
same conversion on a model from anywhere else -- one
trained with Edge Impulse or Roboflow, exported from a
training framework, or downloaded. NPU-equipped boards each have
a vendor compiler that the IDE bundles and drives:
Ethos-U NPUs use Vela, and ST Neural-ART NPUs use ST
Edge AI. The tool takes the target board from the
connected camera (or asks when none is connected) and
takes the model file from you. A model that is already
converted is recognized and just copied, and when the
selected board has no NPU the tool says so and skips
the conversion -- an unconverted model still runs on
those boards, on the CPU.

On NPU boards the conversion is not optional: at best
an unconverted model falls back to the CPU and runs
many times slower, and on some boards it will not run
at all. The ROMFS editor and the model zoo apply the
conversion automatically; this menu entry exists for
models that arrive by other routes.

.. seealso::

   The :doc:`machine learning chapter
   <../../ml/index>` for running models with the
   :mod:`ml` module and training custom ones.
