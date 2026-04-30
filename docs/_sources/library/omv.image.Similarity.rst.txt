.. currentmodule:: image

class Similarity -- Similarity Object
=====================================

The similarity object is an attrtuple returned by `Image.get_similarity()`.

Fields are accessible by name (``similarity.mean``) or by index
(``similarity[0]``). It has no public constructor.

.. class:: similarity

   Please call `Image.get_similarity()` to create this object.

   .. method:: similarity.mean() -> float

      Returns the mean of the similarity values computed across the image.

      Also accessible as ``similarity[0]``.

   .. method:: similarity.stdev() -> float

      Returns the standard deviation of the similarity values computed across the
      image.

      Also accessible as ``similarity[1]``.

   .. method:: similarity.min() -> float

      Returns the min of the similarity values computed across the image. For SSIM
      threshold the min value to determine if two images are different.

      Also accessible as ``similarity[2]``.

   .. method:: similarity.max() -> float

      Returns the max of the similarity values computed across the image. For DSIM
      threshold the max value to determine if two images are different.

      Also accessible as ``similarity[3]``.
