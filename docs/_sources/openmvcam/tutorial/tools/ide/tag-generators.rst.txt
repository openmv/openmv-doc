Tag and barcode generators
==========================

A camera that detects AprilTags needs printed AprilTags
to point at, so the IDE generates them. Tools → Machine
Vision → AprilTag Generator lists the six tag families
the camera can detect, with the family's size in
parentheses:

* TAG16H5 -- 30 tags.
* TAG25H7 -- 242 tags.
* TAG25H9 -- 35 tags.
* TAG36H10 -- 2,320 tags.
* TAG36H11 -- 587 tags. The recommended family: the
  best balance of count, detection robustness, and
  false-positive resistance, and the default in the
  camera's examples.
* ARKTOOLKIT (the ARTOOLKIT family) -- 512 tags.

A *family* is a fixed alphabet of tag patterns designed
together so its members are hard to confuse with each
other; every tag in a family encodes one ID number, and
the detector reports which family member it saw. Pick
one family for a project and generate only the IDs the
project needs -- detection is configured per family,
and fewer valid IDs means fewer false positives.

Choosing a family opens a dialog asking for the range
of tag IDs to generate and whether to print the family
name and ID under each tag (on by default, and worth
keeping -- a floor scattered with anonymous tags is
unidentifiable). The generator then writes one
printable image per tag into a chosen folder -- a
US-Letter page with the label on, a square image
without it. Print them at whatever physical size the
application's detection distance requires, on matte
paper if glare is a concern.

For the other symbologies the camera reads -- QR codes,
Data Matrix codes, and linear barcodes -- the Machine
Vision menu's generator entries open a web search for
online generators rather than generating locally,
since free generators for those formats are
ubiquitous.

.. seealso::

   :meth:`~image.Image.find_apriltags`,
   :meth:`~image.Image.find_qrcodes`,
   :meth:`~image.Image.find_datamatrices`, and
   :meth:`~image.Image.find_barcodes` -- the detection
   side of each generator.
