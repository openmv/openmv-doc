Polly
=====

Polly was a robot created at the MIT Artificial Intelligence Laboratory by Ian
Horswill for his Ph.D. published in 1993. It was the first mobile robot to move
at animal-like speeds (1m per second) using computer vision for its navigation.
It was an example of behavior based robotics. Horswill's PhD supervisors were
Rodney Brooks and Lynn Andrea Stein. For a few years, Polly was able to give
tours of the AI laboratory's seventh floor, using canned speech to point out
landmarks such as Anita Flynn's office. The Polly algorithm is a way to navigate
in a cluttered space using very low resolution vision to find uncluttered areas
to move forward into, assuming that the pixels at the bottom of the frame (the
closest to the robot) show an example of an uncluttered area. Since this could be
done 60 times a second, the algorithm only needed to discriminate three
categories: telling the robot at each instant to go straight, towards the right
or towards the left... (From Wikipedia Article)

For more information, check out Ian's paper
`Analysis of Adaptation and Environment <http://www.cs.northwestern.edu/~ian/aij.pdf>`__

On the CMUcam3, Polly returns histograms that you can use for simple navigation.

Sample images of the polly algorithm running on the CMUcam3
(``polly_sample.jpg``) were not preserved in the archive. The left column was the
original image, the middle column was the filtered and edge detected image, and
the final column showed the histogram. The algorithm is under the assumption that
the area in front of the camera's view is mostly the same texture. This can be
used for simple visual based obstacle avoidance or even navigation. Try making a
robot that drives towards the largest peaks in the histogram.

The default CC3 polly project takes an image and returns a polly histogram in
ASCII text. This can be viewed in a terminal set to 115200 baud, 8N1 with no flow
control or hardware handshaking. To visualize the data try using the
polly-cc2-gui project described below.

**Visualizing Polly with the CMUcam2 GUI**

The following zip file contains a version of polly that works with the CMUcam2
GUI. This implements the few commands required for the GUI to detect the camera
and allow you to call the get histogram command. Only Get Histogram is
implemented, so other CMUcam2 functions will not work correctly. To visualize
polly, start up the CMUcam2 GUI and then go to the histogram tab and press "Get
Histogram".

The ``polly-cc2-gui.zip`` firmware image (CMUcam2 GUI Compatible Polly) that could
test polly inside the CMUcam2 GUI was not preserved in the archive.
