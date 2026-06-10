The dataset editor
==================

Training a custom classifier starts with a labelled
dataset -- hundreds of images of each thing the model
should recognise, captured by the camera that will run
it, sorted into one folder per class. The dataset
editor is the IDE's capture workflow for building one.

Tools → Dataset Editor → New Dataset asks for a folder
to build the dataset in -- warning that a non-empty
folder's contents will be deleted -- and sets it up: a
file browser pane docks on the left of the main
window, and a capture script
(``dataset_capture_script.py``) opens in the editor.
The script is a plain capture loop, and it is meant to
be edited -- apply the
same lens correction, cropping, or filtering the
deployed application will use, so the model trains on
the images it will actually see. Open Dataset reopens
an existing dataset folder later, and Close Dataset
puts the window back to normal.

.. admonition:: Screenshot needed

   ``figures/dataset-editor.png`` -- the main window
   with a dataset open: the dataset pane on the left
   showing two or three class folders with a few
   captured images, the image preview below it, and the
   capture script in the editor. Crop to show the
   dataset pane and part of the editor.

Capturing
---------

While a dataset is open, two buttons join the toolbar
on the window's left edge, below the run controls.
*New Class Folder* (``Ctrl+Shift+N``) creates a class
-- one per category the model should learn, named for
the label.
With the capture script running and a class folder
selected, *Capture Data* (``Ctrl+Shift+S``) saves the
current frame buffer image into that class, and the
preview pane under the file browser shows each capture
as it lands.

The capture rhythm is: select a class, point the camera
at an example of it, capture; move the object, vary the
angle, the distance, the background, the lighting,
capture again -- variation in the dataset is what buys
robustness in the model. Repeat per class, including a
background class of scenes containing none of the
targets if the application needs to know when nothing
is there.

Exporting and training
----------------------

The Export submenu sends the finished dataset to
training. Export Dataset to Zip File packs it into an
archive with class-prefixed file names -- the neutral
format every training service and framework accepts.
For Edge Impulse, the IDE integrates directly: log in
to an Edge Impulse account from the same submenu, and
Upload to Edge Impulse Project pushes the dataset
straight into a project (an API-key upload exists for
accounts where the email-and-password login is not an
option).
Train there, export the model, and the :doc:`NPU
converter <model-zoo>` makes it camera-ready when the
board needs it.

.. seealso::

   The :doc:`machine learning chapter
   <../../ml/index>` for the training workflow the
   dataset feeds into.
