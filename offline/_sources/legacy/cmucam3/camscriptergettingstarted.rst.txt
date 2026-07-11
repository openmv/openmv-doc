Getting Started with CamScripter
================================

Overview
--------

What is it?
~~~~~~~~~~~

The CamScripter is a tool to assist you in writing and debugging customized
scripts for the CMUcam3. It makes it possible to write scripts using the
`Lua <http://www.lua.org>`__ programming language. Using this language and the
provided Lua API for the CMUcam3, you can customize the camera for almost any
use you can think of. In this tutorial we'll walk you through the installation
process and then develop a sample script to run on the camera.

Before You Get Started
~~~~~~~~~~~~~~~~~~~~~~~~

This tutorial assumes:

* You already have a CMUcam3
* You've already gotten the camera working, using either the
  :doc:`Quick Start Guide <quick-start>` or the
  :download:`SDK installation guide <dl/CMUcam3_sdk_guide.pdf>`
* You have everything needed to connect the camera to your computer

Installation, Part 1: Lua, Serial Port Communication
----------------------------------------------------

Lua
~~~

The CamScripter allows you to program the CMUcam3 using the Lua programming
language. Before we can do that, we'll need to install this language on your
computer.

#. Download the appropriate ZIP binary. (For Windows: Lua-Windows or for other
   users
   `https://luabinaries.sourceforge.net/download.html <https://luabinaries.sourceforge.net/download.html>`__)
#. Unzip the Lua binary into ``C:\lua``
#. Open a command prompt (in Windows, select "Run..." from the Start menu, and
   type 'cmd').
#. cd to wherever you unzipped the Lua files. For me, I type 'cd C:\lua'
#. Type 'luax.x.exe -v' where x is the Lua version

Assuming everything went smoothly in your installation, you should see the Lua
version number printed out on your screen.

If possible, you should install lua from the CMUcam3 web site. If you want to
recompile it on your own, you need to first patch the normal lua source to not
use floating point
(`lua-5.1-no-fp.patch <http://lua-users.org/wiki/LuaPowerPatches>`__).

In windows under cygwin, use the following lines to compile:

.. code-block:: text

   cd src
   make LUAC_T=luac.exe MYCFLAGS=-mno-cygwin MYLDFLAGS=-mno-cygwin luac.exe
   ...
   make LUA_T=lua.exe MYCFLAGS=-mno-cygwin MYLDFLAGS=-mno-cygwin lua.exe

Java Runtime Environment (JRE)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A Java Runtime Environment (**version 6 or greater**) is needed for the
CamScripter. If you do not already have a JRE installed, you can download and
install one `here <http://www.java.com/>`__.

RXTX
~~~~

The CamScripter uses the RXTX serial communication library to communicate with
the CMUcam3 over your computer's serial port. This library will have to be
installed on your computer. First, download
`RXTX <http://rxtx.qbang.org/wiki/index.php/Download>`__ (at least version 2.1).
Version 2.1.7 is here:
`http://rxtx.qbang.org/pub/rxtx/rxtx-2.1-7-bins-r2.zip <http://rxtx.qbang.org/pub/rxtx/rxtx-2.1-7-bins-r2.zip>`__.

To install (*Windows only - for other OS's, follow instructions in the rxtx
INSTALL file*):

#. Unzip the RXTX download, and navigate into the resulting folder
#. Double-click on Windows
#. Double-click on i368-mingw32
#. Now you'll have to figure out where your Java Run-time environment is located.
   It is probably in ``C:\Program Files\Java\jre<version number>``. Mine, for
   example, is located in ``C:\Program Files\Java\jre1.6.0_01``. Copy the files
   ``rxtxSerial.dll`` and ``rxtxParallel.dll`` from the RXTX i368-mingw32 folder
   into the folder ``jre/bin``. So in my example, I put those two files in the
   folder ``C:\Program Files\Java\jre1.6.0_01\bin``.

Installation, Part 2: Eclipse
-----------------------------

Okay, we're almost ready to go! Just a few things left to do.

If you don't already have it, install `Eclipse <http://eclipse.org>`__
(**version 3.2 or newer**). You can install it from
`http://eclipse.org/downloads <http://eclipse.org/downloads>`__. Eclipse Classic
is a safe bet, although any of the other packages listed should work as well. To
install, simply unzip your chosen package into ``C:\Program Files\eclipse``.

Now that Eclipse is installed, we need to install the CamScripter as an Eclipse
plugin:

#. Open Eclipse by double-clicking eclipse.exe in ``C:\Program Files\eclipse\``
#. Press Enter to accept the default workspace
#. Open the Install/Update wizard by selecting Help -> Software Updates -> Find
   and Install
#. Select the radio button "Search for new features to install", and click Next.
#. Click the button "New Remote Site..."
#. For name, enter Camscripter, and for URL enter
   ``http://cmucam.org/~juanpablo/``. Click OK.
#. Make sure the box next to Camscripter is checked, and click the "Finish"
   button.
#. Select "Camscripter" as the feature to install, and click Next.
#. Accept the licensing agreement, and click Next
#. Click Finish - Eclipse will download the plug-in for you
#. Click "Install" to install the Camscripter plug-in.
#. Click Yes to restart the Eclipse Platform

Eclipse will then restart, with the Camscripter plugin installed for you. To
make sure it is installed, select Window -> Show View -> Other...

Click the plus sign next to CMUcam3, select "CamScripter", and click OK. You
should see the CamScripter view at the bottom of Eclipse (the area surrounded in
red). You can expand the bottom area if it is too small.

#. CamScripter View
#. Console pane where text messages are displayed
#. Feedback pane where image and graphic messages are displayed
#. Executes Lua code. You can either execute a whole file or just selected lines
   of code.
#. Installs Lua code on CMUcam3's SD/MMC card

Setup
-----

We've installed everything! Just a couple setup steps and we'll be programming
the CamScripter.

Load camscripter project onto camera
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Now that we have everything installed, we need to load the camera with our
CamScripter project. Run make on the camscripter project located in
projects/camscripter (in the source code tree you checked out in
:doc:`Quick Start Guide <quick-start>`), and then load the hex file onto
the camera. Turn the camera off once the file is loaded.

Set CamScripter Preferences
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Now go back to Eclipse, and open the CamScripter Preferences screen: Window -->
Preferences --> CamScripter Setup.

* Set the Luac location to point to your ``luacx.x.exe`` (where x is the Lua
  version) file (note the 'c') wherever you installed Lua in
  `Installation, Part 1: Lua, Serial Port Communication`_.

  * For those interested, luac simply compiles the lua code, while luax.x.exe
    actually interprets and runs the code. We're compiling the code in Eclipse,
    then running it on the camera -- hence, lua\ *c*.

* Provide the name of the serial port you connect your camera to. You can click
  the "See Serial Ports" button to see a list of available serial ports.

Hello, World!
-------------

Now that we have everything installed and configured properly, let's tackle the
obligatory Hello, World program. First, you'll have to create a new project.
Select File --> New --> Project... You'll get a box allowing you to select the
type of project you'd like to create. Double-click "General", select "Project",
and click the Next button.

Name your project "Hello", and click the Finish button. Then create a new file
by clicking File --> New --> File (In Eclipse 3.3. It is File --> New --> Other
--> General --> File). In the filename box, enter "hello_world.lua", with Hello
as the parent folder. Click the Finish button.

Double check that your camera is connected to your computer's serial port.
Before you turn on the camera it is important to understand the two modes the
camera supports:

* **Standalone**: the camera does not expect any interaction with the PC at all.
  By default the camera starts in this mode.
* **Interactive**: the camera receives compiled Lua code from CamScripter in
  Eclipse and returns feedback. **To put the camera in the interactive mode,
  turn it on and when you see the orange LED on, press the camera button (you
  have 3 seconds to press the button).** At that point, the orange LED will
  blink several times letting you know that we are entering interactive mode. If
  everything went well, you'll see the message *Welcome to CamScripter
  Interactive mode. Click the execute button to run a script.*

Let's start the camera in the interactive mode so we can execute our first Lua
program.

In the editor window, enter the line of code:

.. code-block:: lua

   print("Hello, World!");

Save the file and click the Execute button in the CamScripter view. And Voila!!
Your code will have gone over the wire to the camera, which executed it, and sent
back the message you printed out.

Now let's try something a little more interesting. Add three additional lines of
code, so that your file hello_world.lua contains:

.. code-block:: lua

   print("Hello, World!");
   take_picture("pic_name");
   print_picture("pic_name");
   print("It's a picture!");

Now click Execute button again. It will take longer to execute this time, as
sending images through the serial port is pretty time-consuming. Once it
finishes, though, you should see your two messages in the Console area of the
CamScripter, and the image you took with the camera in the Feedback area (you
did remove the lens cap, didn't you?)

You'll notice that it's a pretty low resolution image. The camera is set to take
low resolution pictures by default in the CamScripter, as it takes quite a bit
longer to send high resolution images through the serial port. However, you can
change the camera to high resolution using function
:doc:`LuaApiFunctions <luaapifunctions>`.

Useful Links
------------

The CamScripter is fully installed and configured now, and you've seen a small
example showing off its functionality. If you want to see some larger examples
using the Camscripter, take a look at the sample programs included in the
camscripter/examples directory. A few other notes and links that may help you:

The :doc:`CamScripter Lua API <luaapi>` describes the CMUcam3 functions that you
can use in your Lua programs to control the actions of the CMUcam3.

Here are some links to help you get started using Lua. *Note that external
libraries such as the string and math libraries are not included in the version
of Lua installed on the CMUcam3*. They had to be stripped out to get the Lua
interpreter to fit in the limited space on the CMUcam3.

* `Lua Tutorial <http://lua-users.org/wiki/LuaTutorial>`__ A tutorial to help you
  get started.
* `Lua Reference Manual <http://www.lua.org/manual/5.1/>`__: Complete
  documentation of Lua.
* `Lua Wiki <http://lua-users.org/wiki/>`__ A useful place to find answers.
  Sample code, FAQ, and links to other resources.
* `LuaEclipse <https://sourceforge.net/projects/luaeclipse/>`__ is a useful Eclipse plug-in
  that you may find helpful. It provides syntax highlighting and other facilities
  to make writing Lua code easier.
