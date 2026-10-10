Color-tracking Explanation
==========================

What is tracking a color and how does the CMUcam4 do it?
--------------------------------------------------------

Color tracking is the ability to take an image, isolate a particular color and
extract information about the location of a region of that image that contains
just that color. As an example, assume that you are given a photograph that
contains a red ball sitting on a dirt road. If someone were to ask you to draw a
box around anything that was the color red in the image, you would quite easily
draw a rectangle around the ball. This is the basic idea behind color tracking.
You did not need to know that the object was a ball. You only needed to have a
concept of the color red in order to isolate the object in the picture. Below,
we will briefly address how the CMUcam4 actually uses the information in a camera
image to perform color tracking.

In order to specify color, you need to define a minimum and maximum allowable
value for three color channels. Every unique color is represented by a red,
green, and blue value that indicates how much of each channel is mixed into the
unique color. The tricky part about specifying a color is that you need to define
a range of allowable values for all three color channels. Since light is not
perfectly uniform and the color of an object is not perfectly uniform, you need
to accommodate for these variations. However, you don't want to relax these
bounds too much, or many unwanted colors will be accepted. Since, in the case of
the CMUcam4, each color channel is converted into a number between 0 and 255,
you can bound each channel with two numbers, an upper and lower limit. If you
have two limits for each of the three channels, this means that six values can
be used to constrain the entire color space that you wish to track. If you
imagine the colors being represented by a cube where each side is a different
color channel (red, green and blue) then the six values used to select your
color would draw a three dimensional box inside that cube that defines your
desired set of colors.

Once you have a bound for the color you wish to track, the CMUcam4 takes these
bounds and processes the image. There are many ways to track colors in an image
that can be quite complex. The CMUcam4 uses a simple one pass algorithm that
processes each new image frame from the camera independently. It starts at the
top left of the image and sequentially examines every pixel row by row. If the
pixel it is inspecting falls inside the range of colors that the user specified,
it marks that pixel as being tracked. It also examines the position of the
current tracked pixel to see if it is the top most, bottom most, left most, or
right most position of all the tracked pixel found thus far in the image. If it
finds that the pixel is outside of the current bounding box of the tracked
region, it grows the bounding box to contain this new pixel. Because the location
of even a single tracked pixel can change the bounding box, the bounding box can
sometimes fluctuate quite a bit from frame to frame. Noise filtering (see next
paragraph) can be used to reduce some of that fluctuation. The only other major
piece of information that is stored is a sum of the horizontal and vertical
coordinates of the tracked pixels. At the end the image the CMUcam4 takes the
horizontal sum and the vertical sum of the tracked pixels and divides each by the
total number of tracked pixels and gets a value that shows where the middle of
the tracked object is located. Because each tracked pixel only contributes a
small part to the final horizontal and vertical sums the middle (often called the
centroid) of the tracked pixels is typically a much more stable measurement than
the bounding box. Once all of the pixels in the image have been checked, the
total number of tracked pixels can also be used in conjunction with the area of
the bounding box to calculate the confidence of and the number of pixels in the
tracked object.

Noise filtering allows us to make the color tracking ranges larger so we can
accommodate larger variations in the image pixel values without causing other
random variations in the image to be tracked. The idea behind noise filtering is
that we only want to consider a pixel to be of the tracked color if it is part of
a group of pixels that are within the color tracking bounds. In the CMUcam4 we
implement this in a way that only requires a single pass over the image. While
processing the pixels in an image the CMUcam4 maintains a counter which keeps of
track of how many sequential pixels in the current row, before the current pixel
were within the tracked color bounds. If that value is above the noise filter
value then the current pixel is marked as a tracked pixel.

What is a histogram and what is it good for?
--------------------------------------------

A histogram is a type of chart that displays the frequency and distribution of
data. In the case of the CMUcam4, the histogram shows the frequency and
distribution of color values found in an image. Each bar represents a range of
color values for a specific channel. The CMUcam4 can divide the possible color
values from 0 to 255 into 1, 2, 4, 8, 16, 32, and 64 different bins. Each bin
contains the number of pixels found in the image that fall within some color
bounds. So a large value in one particular bin, means that many of those colors
were found in the image. Each histogram only represents one select channel of
color.

Histograms are a way of abstracting the contents of an image. They have many uses
such as primitive object recognition, thresholding or color balancing. They are
particularly useful for distinguishing between different textures. Try pointing
the CMUcam4 with auto-gain turned off at two different textured surfaces and
notice the difference in their color distributions. This effect can be used to
distinguish floor surfaces or detect obstacles.
