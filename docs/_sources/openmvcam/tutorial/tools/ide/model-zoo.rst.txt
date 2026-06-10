The model zoo and NPU conversion
================================

The IDE ships with a library of pretrained
machine-learning models -- face detection, person
detection, object detection, pose estimation, and more
-- kept current through the IDE's resource updates. Tools →
Machine Vision → Open Model Zoo browses it: selecting
a model shows its description page alongside the file
tree, and a filter narrows the list to models that fit
the selected board.

.. admonition:: Screenshot needed

   ``figures/model-zoo.png`` -- the Model Zoo browser
   open with the model list visible and one model
   selected showing its description, the
   filter-by-board-type checkbox visible. Capture the
   whole dialog.

Choosing a model copies it out ready to run: the IDE
converts it for the target board's NPU accelerator when
the board has one, copies the matching labels file
alongside it, and defaults the destination to the
connected camera's drive. From there the script side is
one :class:`ml.Model` constructor call away. The same
browser is reachable from inside the :doc:`ROMFS editor
<romfs>`, which is the better destination for models on
boards that have ROMFS -- models in ROMFS execute
straight from flash without a RAM copy.

Converting other models
-----------------------

Tools → Machine Vision → Convert Model for NPU runs the
same conversion on a model from anywhere else -- one
trained with Edge Impulse, exported from a training
framework, or downloaded. NPU-equipped boards each have
a vendor compiler that the IDE bundles and drives:
Ethos-U NPUs use Vela, and ST Neural-ART NPUs use ST
Edge AI. The tool uses the connected camera's board --
or asks for the target board when none is connected --
then takes the model file, detects whether the model
is already converted (and just copies it if so), and
tells you when the selected board has no NPU and needs
no conversion -- an unconverted model still runs on
such boards, on the CPU.

The conversion is the difference between a model
running in milliseconds and running in seconds on NPU
boards, so it is not optional there. The ROMFS editor
and the model zoo apply it automatically; this menu
entry exists for models that arrive by other routes.

.. seealso::

   The :doc:`machine learning chapter
   <../../ml/index>` for running models with the
   :mod:`ml` module and training custom ones.
