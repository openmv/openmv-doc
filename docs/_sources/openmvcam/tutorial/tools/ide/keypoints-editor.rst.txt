The keypoints editor
====================

Keypoint matching with
:meth:`~image.Image.find_keypoints` works from a saved
descriptor file -- the ``.orb`` file a script writes
with :func:`image.save_descriptor` after extracting
keypoints from a reference object (the keypoints
examples in the Examples menu show the capture
workflow). Real descriptors usually pick up junk:
corners of the background, specular highlights,
features that belong to the scene rather than the
object. The keypoints editor, under Tools → Machine
Vision → Keypoints Editor, is the cleanup tool.

*Edit File* opens a descriptor (``.orb`` or ``.lbp``)
alongside the image it was extracted from -- the editor
finds the matching image file saved next to the
descriptor -- and draws every keypoint on the image.
Select the outliers with the mouse and remove them with
the delete key; checkboxes toggle the visibility of
each detection octave to work through the scales one at
a time. Saving writes the trimmed descriptor back,
first copying the previous descriptor and image to
``.bak`` files (an earlier ``.bak`` is replaced).

*Merge Files* combines several descriptor files into
one. Capture descriptors of the same object from a few
angles and distances, merge them, and the result
matches the object across more poses than any single
capture would.
