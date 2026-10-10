Lua API: image
==============

Description
-----------

The image data structure is used as a receptacle to store image information from
the CMUcam3 picture buffer.

Example
-------

Here is an example where the image data type is used to store

Constructor
-----------

See :doc:`image_new <luaapifunctions>`

Methods
-------

* ``dispose``
* ``get_channels``
* ``get_height``
* ``get_width``
* ``set_channels``

dispose
~~~~~~~

``img:dispose()``

:Parameters: none
:Return Values: none

Provides a way to explicitly dispose of memory associated with this image,
instead of waiting for the Lua garbage collector to dispose of that memory.
**Warning:** Errors are likely to result from using an image object after
calling dispose on it, it's highly recommended that you not do so.

get_channels
~~~~~~~~~~~~

``img:get_channels()``

:Parameters: none
:Return Values: the channel of interest for this image.

Get the channel(s) of interest for this image structure. See the Channel of
Interest Constants in :doc:`luaapiconstants` for possible return values.

get_height
~~~~~~~~~~

``img:get_height()``

:Parameters: none
:Return Values: the height of this image

Get the height of this image.

get_width
~~~~~~~~~

``img:get_width()``

:Parameters: none
:Return Values: the width of the image

Get the width of the image.

set_channels
~~~~~~~~~~~~

``img:set_channels(integer channel_of_interest)``

:Parameters: ``channel_of_interest``, the channel of interest
:Return Values: none

Set the channel of interest for this image. ``channel_of_interest`` must be one
of the channel of interest constants in :doc:`luaapiconstants`.
