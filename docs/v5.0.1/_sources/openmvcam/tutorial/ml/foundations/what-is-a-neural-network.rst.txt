What is a neural network
========================

A *neural network* is an algorithm whose behaviour is *learned* from
examples rather than coded by hand. The same network architecture,
given a million face images, learns to detect faces. The same
architecture, given a million hand images, learns to detect hands.
The same architecture, given a labelled set covering many object
categories, learns to detect all of them at once. Only the weights
change between targets, and the weights are produced by an off-board
training process that watches the network's predictions against
labelled examples and adjusts the weights until they match.

The mechanism
-------------

A neural network is a stack of layers. Each layer multiplies the
previous layer's output by a matrix of *weights*, adds a bias vector,
and applies a non-linear function to the result. The output of one
layer is the input to the next. A captured image enters at the top of
the stack, flows down through tens or hundreds of layers, and emerges
at the bottom as a tensor whose entries describe what was in the
image.

What each layer's weights *do* depends on what the network was
trained on. An early-layer weight matrix in a vision network might
fire on a short horizontal edge; a slightly deeper one might fire on
a corner; a deeper one might fire on a circular eye shape; the
deepest layers might fire on whole-face arrangements. None of this
was written by hand. The training process iterated over millions of
labelled examples, nudged the weights downhill on a loss function,
and the edge-then-corner-then-eye-then-face hierarchy fell out of the
data.

.. figure:: ../figures/network-as-stack.svg
   :alt: A vertical stack of nine labelled boxes representing the
         layers of a small classification network. The top box is
         labelled "Input image" with a tensor shape of (192, 192, 3).
         An arrow leads down to a "Conv + ReLU" box with shape
         (96, 96, 32). Another arrow leads to a second "Conv + ReLU"
         box with shape (48, 48, 64). A "MaxPool" box follows with
         shape (24, 24, 64). Two more "Conv + ReLU" boxes follow with
         shapes (12, 12, 128) and (6, 6, 256). A "Global average
         pool" box has shape (256,). A "Fully connected" box has
         shape (1000,). The bottom box is labelled "Class scores"
         with shape (1000,). The tensor flow is top to bottom.

   A small classification network as a stack of layers. The input
   tensor enters at the top with the captured image's shape and
   flows down through the layers, with each one transforming the
   tensor's dimensions. The output tensor at the bottom has one
   entry per class. Detection and keypoint networks share the same
   stack-of-layers form; only the output tensor's interpretation
   changes.

The network's *architecture* -- how the layers are arranged, which
operations connect them -- is what the network *can* do. The weights
are what the network *has* learned. The cam's part of this is to load
the weights file produced by training and run the same arithmetic the
trainer ran, but on the captured frame instead of the training set.

What gets fed in, what comes out
--------------------------------

Both ends of the network are *tensors* -- multi-dimensional arrays of
numbers, the same kind of object the numpy chapter just introduced.
The input tensor for a vision network is the captured image
re-arranged into the layout the network expects: typically a
``(B, H, W, C)`` 4-tuple shape where ``B`` is the batch dimension
(always 1 on the cam, since one frame is processed at a time), ``H``
and ``W`` are the network's expected pixel height and width, and
``C`` is the channel count (3 for an RGB network, 1 for grayscale).

The output tensor depends on what the network is for:

* A *classification* network produces a 1-D tensor of confidence
  scores, one per class. The index of the largest score is the
  predicted class. The MobileNet-derived person detector that ships
  on most cams is this form: two scores, one for "person", one for
  "not person".
* A *detection* network produces a 2-D tensor whose entries describe
  a list of bounding boxes plus class probabilities. YOLOv8 is this
  form: an ``(84, N)`` tensor where 4 of the 84 rows are
  box-regression values and the other 80 are per-class probabilities,
  repeated across ``N`` anchor positions.
* A *keypoint* network produces a tensor whose entries are pixel
  positions of named landmarks. The MediaPipe face-landmarks model
  is this form: 468 keypoints per detected face.
* A *segmentation* network produces a 2-D tensor whose entries are
  per-pixel class labels -- the same dimensions as the input, with a
  category index at every position.
* A *regression* network produces a single number or a short vector
  of numbers -- a depth estimate, an angle, a temperature.

Each form has its own *post-processor* on the cam that converts the
raw output tensor back into the result form the rest of the
application uses -- bounding boxes, keypoint lists, class labels,
numeric estimates. The post-processor is application-side code that
knows the network's output layout; the network itself is just the
arithmetic that produces the tensor.

Why this works on a cam
-----------------------

Two pieces of arithmetic make this practical for a
microcontroller-class part. The first is *quantization*. Training
happens in 32-bit
floating-point arithmetic; inference can run in 8-bit integer
arithmetic with almost no accuracy loss for most networks. Eight-bit
weights take a quarter of the storage and run several times faster
than the 32-bit floats. Every model the cam ships with has already
been quantized off-board.

The second is *hardware acceleration*. The same arithmetic that a
microcontroller's CPU plods through one instruction at a time, a
neural-network accelerator runs hundreds of operations at once. The
newer cams (the AE3 and the N6) carry a dedicated *neural processing
unit* (*NPU*) -- a tensor accelerator on the SoC -- that turns a model
which would have taken a second to run on the CPU into one that runs
in tens of milliseconds.
The Inference engines chapter covers what the cam's part of this
looks like.

What the chapter covers
-----------------------

Training is not the cam's job. A trained model arrives on the cam as
a ``.tflite`` file; the cam loads it, runs each captured frame
through it, and decodes the resulting tensor into a result the
application can act on. Everything that follows is
about each of those steps:

* loading and inspecting a model;
* the flash partition where model files live;
* the four stages of an inference call;
* the engines that actually do the arithmetic;
* and the post-processors that turn an output tensor back into a
  list of boxes, keypoints, or classes.

The detectors in the image chapter were each scoped to a particular
target. The ones the rest of this chapter covers are trained from
data instead, with the same engine running whatever model the script
loads. The workflow change that came with them -- a target-specific
algorithm replaced by a target-specific weights file -- is the next
thing to draw out.
