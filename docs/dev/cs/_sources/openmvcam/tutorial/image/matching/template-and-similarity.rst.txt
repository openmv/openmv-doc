Template matching
=================

The detectors covered so far answer
questions about the *content* of a single
frame: where the blobs are, where the lines
go, what a printed code says. A different
class of question compares one image
against another. *Does this region of the
captured frame look like the reference
patch I stored at calibration time?* The
matching methods answer that question.

Tonal and statistical analysis introduced
:meth:`~image.Image.get_similarity` for the
related question -- *how alike are these
two same-sized images overall?* -- with
SSIM as the underlying metric. The
remaining matching question is the
*localisation* one: not "how alike are
these two images" but "where inside this
larger image does that smaller patch
appear?" The right tool for the
localisation question is *template
matching*.

The basic call
--------------

:meth:`~image.Image.find_template` looks
for the first place a small *template*
image appears inside the captured frame.
The implementation uses *normalised
cross-correlation* (NCC): the template
slides across the frame, the per-position
match score is computed from the
correlation between template pixels and
the underlying frame pixels (normalised
against the local means and variances so
that gain changes don't fool the match),
and the first position whose score clears
``threshold`` is returned as a bounding
box:

::

    template = image.Image("/sdcard/template.bmp", copy_to_fb=False)
    template.to_grayscale()

    match = img.find_template(template, threshold=0.7,
                               search=image.SEARCH_DS)

    if match is not None:
        img.draw_rectangle(match, color=(255, 0, 0))

The method *only works on grayscale
images*. Capture in grayscale (the natural
choice for any cam without a colour
sensor), or convert in place via
:meth:`~image.Image.to_grayscale` before
the call. The same applies to the template
loaded from disk: a colour template is
converted with the same method, the result
is what the matcher expects.

``threshold`` is a float from ``0.0`` to
``1.0``. A value of ``1.0`` demands a
perfect pixel-for-pixel match (which never
happens with real captured images), ``0.0``
accepts anything, and values between ``0.6``
and ``0.8`` cover the common case where the
template was captured under similar lighting
and the scene has not changed dramatically. Raise the
threshold to suppress false positives;
lower it to accept noisier matches at the
cost of more spurious hits.

Search strategy
---------------

``search`` chooses between two strategies.
:data:`image.SEARCH_EX` is the *exhaustive*
search: the template slides through every
``step``-pixel position in the frame and
returns the first hit above threshold.
:data:`image.SEARCH_DS` is the *diamond
search*: the matcher samples coarsely
first, then refines around the best score,
which is dramatically faster but can miss
a true match if the coarse pass happened to
land near a local maximum that beats the
global one. For a real-time pipeline where
the template is well-defined and unlikely
to be confused, ``SEARCH_DS`` is the right
default; for a one-shot calibration where
the cost of a miss is higher than the cost
of a slower scan, ``SEARCH_EX`` is safer.

``step`` controls the pixel skip during the
exhaustive pass (the diamond search manages
its own step). Larger ``step`` values speed
up the scan at the cost of sub-pixel
accuracy. ``roi`` restricts the search to a
region of the frame, both narrowing what
the matcher considers and reducing work.

The returned value is a ``(x, y, w, h)``
bounding-box tuple identifying the best
match, or ``None`` if no position cleared
the threshold. The bounding box drops
directly into
:meth:`~image.Image.draw_rectangle` or
:meth:`~image.Image.crop` for the next
stage of processing.

The scale and rotation trap
---------------------------

The classical pitfall with template
matching is *scale and rotation
sensitivity*. The matcher compares the
template against the frame pixel-for-pixel;
a template captured at one distance does
not match the same object captured at a
different distance, and a template
captured straight-on does not match the
same object viewed off-axis. The threshold
quietly drops below the matching level
even when the object is plainly visible to
a human eye, and the method returns
``None``.

A few workarounds exist for the simple
cases. The application can capture
multiple templates at different scales and
run :meth:`~image.Image.find_template` for
each in sequence, accepting the first
that clears threshold; the cost scales
with the number of templates. The
application can pre-process the frame
with :meth:`~image.Image.rotation_corr` or
the polar transform (Geometric transforms)
to remove the offending rotation before
the match runs; the matched template still
has to match the corrected geometry.

A useful idiom for QA-inspection pipelines
pairs the template matcher with the
similarity scorer Tonal and statistical
analysis introduced:
:meth:`~image.Image.find_template` locates
the part in the captured frame and the
returned bounding box is cropped out and
passed to :meth:`~image.Image.get_similarity`
against the reference patch. The
template-match step decides *where the
part is*; the similarity-score step decides
*whether the part is acceptable*. The two
steps run every frame, the threshold on
``mean`` is the pass/fail gate, and the
matched bounding box drawn back into the
frame is the IDE preview the operator
watches.
