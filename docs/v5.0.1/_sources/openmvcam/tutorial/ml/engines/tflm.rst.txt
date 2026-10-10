TensorFlow Lite for Microcontrollers
====================================

*TFLM* is the runtime most cams use to execute a loaded model. It
parses the ``.tflite`` file -- a FlatBuffer of operators, weights,
and tensor shapes -- and walks the operator list in order,
dispatching each operator to a kernel that produces the next
intermediate tensor.

Intermediate tensors live in a fixed-size *tensor arena* allocated
at load time. The cam sizes the arena in two passes: first, a
throwaway interpreter is built against the maximum free heap so
the model can report the working memory it needs; the persistent
interpreter is then allocated with that exact size plus a small
margin. Smaller models leave more heap free for the rest of the
script.

TFLM is the engine on the H7, the RT1062, and the AE3.

.. figure:: ../figures/engine-stack.svg
   :alt: Three columns side by side. Left: H7 and RT1062 run TFLM
         with CMSIS-NN kernels on a Cortex-M7. Middle: AE3 runs
         TFLM with CMSIS-NN and the Ethos-U operator on a
         Cortex-M55 with an Ethos-U55 NPU. Right: N6 runs STAI on
         a Neural-ART NPU.

   The engine in the middle of :meth:`~ml.Model.predict` is a
   different stack on each cam family.

The op resolver
---------------

TFLM does not ship every kernel. The cam links in a *resolver*
that lists the operators it can execute, and a model loaded
against the resolver fails at load time if it contains an operator
not on the list. The shipped build registers the operators common
in vision and signal-processing networks -- the convolution and
dense layers, the pool and activation layers, the reshape and
concat operators, the quantize and dequantize operators -- so a
model trained against one of the standard architectures (YOLO,
MediaPipe, MobileNet) loads without extending the list.

The AE3 build additionally registers the Ethos-U operator. A
Vela-compiled model is otherwise a normal ``.tflite``, and TFLM
walks it normally; the Vela-tagged subgraphs hit the Ethos-U
operator and dispatch to the :doc:`NPU <npus>`.
