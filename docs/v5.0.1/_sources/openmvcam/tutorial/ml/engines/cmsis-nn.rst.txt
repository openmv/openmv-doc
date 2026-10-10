CMSIS-NN
========

The operator list TFLM walks is mostly a handful of heavy
operators: *convolution* sliding a small grid of learned weights
over an input tensor and writing the weighted sum at each
position; *depthwise convolution* doing the same per channel;
*fully-connected* matrix multiplies between a vector of inputs
and a matrix of weights; *pooling* shrinking a tensor by taking
the max or average over small neighbourhoods; *activation
functions* like ReLU and sigmoid running pointwise across every
value. A vision inference spends most of its cycles inside those
few operators.

Implemented the straightforward way, they would be slow on a
microcontroller. *CMSIS-NN* is
Arm's library of fast ones -- hand-tuned in assembly,
integer-quantized to the ``int8`` and ``uint8`` values
:doc:`tensor I/O <../pipeline/tensor-io>` described, and written
against the CPU's *SIMD* instructions. SIMD -- Single
Instruction, Multiple Data -- lets the CPU run one arithmetic
operation across several values in the same cycle. A plain
scalar multiply-add produces one result per cycle; a SIMD
multiply-add packs several values into a wide register and
produces all of them at once.

The Cortex-M7 on the H7 and the RT1062 has Arm's *DSP extension*,
which holds four ``int8`` values in a 32-bit register and runs a
multiply-add over all four in a cycle. The Cortex-M55 on the AE3
has *Helium* -- formally *MVE*, the M-profile Vector Extension --
which holds sixteen ``int8`` lanes in a 128-bit register, four
times the throughput per cycle. Helium is a wider CPU instruction
set, not an accelerator; the :doc:`Ethos-U55 NPU <npus>` on the
same die is the accelerator.

The shipped TFLM builds are linked against CMSIS-NN, and TFLM
dispatches each heavy operator to the right SIMD variant for the
cam at runtime. On the AE3 the dispatch is a little more
involved: the Vela compiler has already walked the model offline
and marked connected slices of NPU-eligible operators --
*subgraphs* -- for dispatch to the Ethos-U. At inference time
those subgraphs run on the accelerator in one block, and the
rest fall back to Helium CMSIS-NN on the M55.

Float operators bypass CMSIS-NN entirely and run through TFLM's
portable reference kernels. The accuracy gap between an ``int8``
and a float model is usually small; the throughput gap is large.
Models shipped on the cam are quantized to ``int8`` for this
reason.
