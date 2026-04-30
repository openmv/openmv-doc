.. currentmodule:: image

class HaarCascade -- Feature Descriptor
=======================================

The Haar Cascade feature descriptor is used by `Image.find_features()`. The
underlying class name is ``Cascade``. Instances have no methods or attributes
of their own and are created by `image.HaarCascade()`.

Construction
------------

The class has no public constructor. Use `image.HaarCascade()` to load a
cascade and obtain a ``Cascade`` instance. The ``Cascade`` class itself
exposes no methods or attributes — it's an opaque handle used by
`Image.find_features()`.

.. class:: Cascade

   Opaque cascade handle returned by `image.HaarCascade()`.
