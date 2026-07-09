Viola Jones Face Detector
=========================

The Viola-Jones sample project that comes with the CMUcam3 is an example of a
lightweight face detector. The algorithm is based on the well known paper "Robust
Real-Time Face Detection" by P. Viola and M. Jones from 2004
(:download:`viola-ijcv04.pdf <dl/viola-ijcv04.pdf>`). The implementation on the CMUcam3 will return
coordinates for boxes where it detects a face in the image. If you test this code
with a relatively uniform background (like a white wall), it works reasonably
well. The images are trained from the CMU face database such that they generalize
to all faces. Sometimes certain faces with features not found in the database can
confuse the detector.

.. |ri1| image:: img/face.jpg
   :alt: Sample Face 1
.. |ri2| image:: img/face1.jpg
   :alt: Sample Face 2

.. container:: legacy-center

   |ri1| |ri2|

The paper (:download:`viola-ijcv04.pdf <dl/viola-ijcv04.pdf>`) introduces a novel
technique to detect faces in real-time and with very high detection rate. It is
essentially a feature-based approach in which a classifier is trained for
Haar-like rectangular
`features <http://csdl2.computer.org/persagen/DLAbsToc.jsp?resourcePath=/dl/proceedings/&toc=comp/proceedings/iccv/1998/8295/00/8295toc.xml&DOI=10.1109/ICCV.1998.710772>`__
selected by `Adaboost <http://en.wikipedia.org/wiki/Adaboost>`__. The test image
is scanned at different scales and positions using a rectangular window, and the
regions which pass the classifier are declared as faces. One of the major
contributions of this paper is the extremely rapid computation of these features
using the concept of Integral Image, which enables the detection in real-time.
Additionally, instead of learning a single classifier and computing all the
features for all the scanning windows in the image, a number of classifiers are
learnt which are put together in a series to form a cascade. The classifiers in
the beginning of the cascade are simpler and consist of smaller numbers of
features. However, as one proceeds in the cascade, the classifiers become more
complex. A region is reported as detection only if it passes all the classifier
stages in the cascade. If it is rejected at any stage, it is discarded and not
processed further. This way, the easier patches in the image which the "cascade of
classifiers" is sure of not being a face, are rejected very early while the
difficult regions are operated on by more complex classifiers. This greatly speeds
up the detection process without compromising on the accuracy and provides high
detection rate. This overall system provides performance comparable to the
existing best face detector systems (Rowley et al., 1998
:download:`CVPR00.pdf <dl/CVPR00.pdf>`; Schneiderman and Kanade, 2000
:download:`nips00.pdf <dl/nips00.pdf>`; Roth at al., 2000
:download:`rowley-ieee.pdf <dl/rowley-ieee.pdf>`) but with orders of magnitudes
faster than any of these systems. On a conventional desktop, it can detect faces
at 15 frames per second.

More information on the Viola-Jones face detector and its CMUcam3 implementation
can be found in our :download:`CC3 Face Detector <dl/cc3_face_detector.pdf>`
document.

**Extra Utilities and Images**

* :download:`generate_feat_in_struct_for_C.m <dl/generate_feat_in_struct_for_C.m>`

  * This Matlab file prints the learned adaboost model in a text file so that it
    can be easily imported in vj.h

* :download:`get_scaled_feature.m <dl/get_scaled_feature.m>`

  * This file used by generate_feat_in_struct_for_C.m

* Test images we used for the viola-jones face detector

  * `Face DB <http://www.cs.ubc.ca/~pcarbo/viola-traindata.tar.gz>`__
    `Face DB2 <http://vasc.ri.cmu.edu/idb/images/face/frontal_images/images.tar>`__
