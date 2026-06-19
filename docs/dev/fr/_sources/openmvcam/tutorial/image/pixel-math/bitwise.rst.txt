Bitwise operations
==================

The arithmetic operations on the previous page
work on pixel *values* -- the integer
brightnesses or the packed colour words.
*Bitwise* operations work one level lower, on
the individual bits inside those values. For
*binary* images, where each pixel is just one
bit, the bitwise operations are the natural
arithmetic.

The bitwise family
------------------

The :class:`Image` class exposes the full set
of two-input bitwise operations:

* :meth:`~image.Image.b_and` -- bitwise AND.
* :meth:`~image.Image.b_or` -- bitwise OR.
* :meth:`~image.Image.b_xor` -- bitwise
  exclusive-OR.
* :meth:`~image.Image.b_nand` -- NOT-AND.
* :meth:`~image.Image.b_nor` -- NOT-OR.
* :meth:`~image.Image.b_xnor` -- NOT-XOR.

Each operates per-bit on every byte of both
images' buffers. On a binary image, where each
byte holds eight pixels, the operation runs on
eight pixels per byte processed. On a grayscale
or colour image it runs on every bit of every
channel.

.. figure:: ../figures/bitwise-truth-table.svg
   :alt: Three truth tables for the AND, OR,
         and XOR operations side by side. Each
         table has four rows for the input
         combinations 0-0, 0-1, 1-0, 1-1 and
         columns labelled A, B, and result.
         Below the truth tables, two small
         binary images A and B are drawn as
         grids of black and white cells, with
         the result of ANDing them shown to the
         right as a grid that keeps only the
         cells that were white in both.

   Top: the AND, OR, and XOR truth tables --
   the bit-level semantics of each operation.
   Bottom: two binary images A and B and the
   result of ``A.b_and(B)``, where the result
   keeps only the positions that were on in
   both inputs.

Combining masks
---------------

The single most common use of these operations
is *combining masks*. A mask is a binary image
that says, position by position, whether some
condition is met. Two masks describing
different conditions combine into a single
mask describing a compound condition through
one of the bitwise operations:

:meth:`~image.Image.b_and` produces a mask
whose positions are on only when *both* input
masks were on at that position -- the natural
"and" of two conditions. Combining a
foreground mask with the output of a
thresholding pass through ``b_and`` restricts
the threshold's matches to the foreground.

:meth:`~image.Image.b_or` produces a mask
whose positions are on whenever *either*
input mask was on -- the natural "or".
ORing two thresholded outputs together
produces a single mask covering anything that
matched either of two colour ranges.

:meth:`~image.Image.b_xor` produces a mask
whose positions are on whenever *exactly one*
input mask was on. Useful for detecting
positions where two masks *disagree* -- the
positions where the threshold output changed
between two frames, the symmetric difference
between two reference masks, that kind of
thing.

The negated variants --
:meth:`~image.Image.b_nand`,
:meth:`~image.Image.b_nor`,
:meth:`~image.Image.b_xnor` -- produce the
complement of their non-negated counterparts.
They are useful when the natural way to
describe a condition is "neither of these" or
"not both" -- not common, but worth knowing
exist so that the negation does not have to
be composed by following an AND with a
separate :meth:`~image.Image.invert`.

Bitwise on non-binary images
----------------------------

The bitwise operations also run on grayscale and
colour images. They are most useful there when
the image holds binary-like content -- a
grayscale frame whose pixels are all ``0`` or
``255``, an RGB565 frame with only fully-black
and fully-white pixels -- where AND, OR, and
XOR give the same combinations they would on a
true binary image. For images that span the
full range of values, the arithmetic operations
on the previous page are usually a better fit.
