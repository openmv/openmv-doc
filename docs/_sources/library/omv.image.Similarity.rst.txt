.. currentmodule:: image

class Similarity -- Similarity Object
=====================================

The similarity object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.get_similarity()`. It summarises a Structural Similarity
(SSIM) comparison between two images by reporting four statistics computed
over the per-block SSIM values. Each block of the image contributes one SSIM
value; the four fields below describe the distribution of those values.

Use `Image.get_similarity()` to compute SSIM against another :class:`Image`
or against a solid color. The match is **stronger** the closer the values are
to 1.0; a value of -1.0 means the two images are perfectly inverted.

Fields are accessible by attribute name (``similarity.mean``) or by index
(``similarity[0]``). The object has no public constructor.

.. class:: similarity

   Please call `Image.get_similarity()` to create this object.

   .. attribute:: mean

      Mean of the SSIM values across all blocks. Best single number to
      describe overall similarity. Float in the range -1.0 to 1.0. Index
      ``[0]``.

   .. attribute:: stdev

      Standard deviation of the per-block SSIM values. Float. Index ``[1]``.

   .. attribute:: min

      Minimum per-block SSIM value. Useful as an SSIM-style threshold to
      detect a localised difference between the two images (a single block
      that disagrees pulls ``min`` down even when ``mean`` stays high).
      Float. Index ``[2]``.

   .. attribute:: max

      Maximum per-block SSIM value. Useful as a DSIM-style threshold to
      detect that two images that should differ are actually still
      similar in at least one block. Float. Index ``[3]``.
