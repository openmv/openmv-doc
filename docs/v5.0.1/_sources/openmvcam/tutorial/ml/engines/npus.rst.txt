NPUs
====

The H7 and the RT1062 run inference on a Cortex-M CPU through
:doc:`TFLM <tflm>` and :doc:`CMSIS-NN <cmsis-nn>`. The AE3 and the
N6 add a dedicated NPU on the same die -- a tensor pipeline in
fixed silicon that runs the heavy operators without occupying the
CPU. The two NPUs in OpenMV's lineup come from different vendors
and their toolchains are different, but the cam exposes both
through the same :class:`ml.Model` API. What differs is the file
on disk and the runtime that walks it.

AE3 -- Arm Ethos-U55
--------------------

The AE3 carries an Arm *Ethos-U55* NPU on the same die as the
Cortex-M55 application core. *Vela* is the offline compiler that
prepares a model for it: Vela takes a standard ``.tflite`` in and
emits a ``.tflite`` out whose NPU-eligible subgraphs have been
folded into a custom *Ethos-U* operator carrying the byte commands
the NPU runs. At inference time, :doc:`TFLM <tflm>` walks the file
normally; the Ethos-U operator dispatches its byte commands
through the Ethos-U driver, and any operator Vela did not fold
falls back to :doc:`CMSIS-NN <cmsis-nn>` on the M55.

N6 -- ST Neural-ART
-------------------

The N6 carries ST's *Neural-ART* NPU and runs *STAI* -- ST's
runtime for it -- in place of TFLM. *STEdgeAI* is the offline
compiler: it takes a model in and emits a relocatable network
blob laid out for the Neural-ART hardware. STAI loads the blob
from :doc:`ROMFS <../ml-module/romfs>` and walks it directly on
the NPU. Operator coverage is whatever STEdgeAI supports for the
part.

Same script, different cam
--------------------------

Both NPUs expose the same input and output tensors with the same
quantization parameters as a CPU-run model would. A script written
against one cam runs on another by loading a model file prepared
for that cam's NPU. Detection thresholds, ROI handling, and
post-processor wiring -- the script-level decisions -- do not
change.
