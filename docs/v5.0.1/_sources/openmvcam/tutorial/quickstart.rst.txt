Quick start
===========

.. image:: ../camera.jpg
    :class: framed
    :alt: OpenMV Cam
    :width: 100%

Welcome -- we're excited to introduce you to the OpenMV Cam, a small,
programmable camera that runs Python right on the device. Write a few
lines of code, press run, and the camera starts seeing: detecting
faces, tracking colours, reading tags, following lines -- no PC in the
loop and no heavy setup to wade through first.

This quick start guide will have you up and running in a few minutes:
you'll install the IDE, connect your camera, and run a live face
detector as your very first script.

`Install OpenMV IDE <https://openmv.io/pages/download/>`__
----------------------------------------------------------

OpenMV IDE is the desktop application for writing scripts, running
them on the camera, and watching the results live. Download it for
Windows, macOS, or Linux `here <https://openmv.io/pages/download/>`__,
then install it:

* **Windows** -- run the installer. It installs the IDE along with
  the camera's USB drivers; follow the default prompts.
* **macOS** -- open the ``.dmg`` and drag **OpenMV IDE** onto the
  Applications folder.
* **Linux** -- run ``chmod +x openmv-ide-*.run && ./openmv-ide-*.run``,
  then follow the installer prompts.

.. note::

   For automated or headless setups, the installers also run from the
   command line with silent-install flags. See the `openmv-ide README
   <https://github.com/openmv/openmv-ide#instructions-for-running-the-installer-silently>`__
   for the exact per-platform commands.

Connect your camera
-------------------

Plug the camera into your computer with a USB data cable. Wait for
its drive to mount and the blue LED to start blinking, then click the
connect button -- the plug icon at the bottom of the toolbar.

The first time you connect, the IDE compares the camera's firmware
against the version it ships with and offers to update it. Accept the
prompt to flash the latest firmware; it takes a few seconds, and the
IDE reconnects on its own when it finishes.

If the camera does not show up, or you want the details of what
connecting and updating do, see :doc:`tools/ide/connecting` and
:doc:`tools/ide/firmware`.

.. note::

   Stuck on something? Post on the `OpenMV forums
   <https://forums.openmv.io>`__ -- the community and the OpenMV team
   are happy to help.

Run your first script
---------------------

Your OpenMV Cam ships with Google's MediaPipe **BlazeFace** face
detector on flash. Paste this script into the editor:

::

    import csi
    import time
    import ml
    from ml.postprocessing.mediapipe import BlazeFace

    # Set up the camera sensor.
    csi0 = csi.CSI()
    csi0.reset()                # Initialize the sensor to a known state.
    csi0.pixformat(csi.RGB565)  # Capture 16-bit colour.
    csi0.framesize(csi.QVGA)    # Set a small, fast frame size.

    # BlazeFace was trained on square images, so crop to a centred
    # square the size of the sensor's height.
    side = csi0.height()
    csi0.window((side, side))

    # Load the built-in face detector. The post-processor turns the
    # network's raw output into a list of detections; threshold sets how
    # confident a detection must be to count.
    model = ml.Model("/rom/blazeface_front_128.tflite",
                     postprocess=BlazeFace(threshold=0.4))

    clock = time.clock()        # For measuring the frame rate.
    while True:
        clock.tick()
        img = csi0.snapshot()   # Capture one frame.

        # predict() runs the network and returns one
        # ((x, y, w, h), score, keypoints) tuple per detected face.
        for rect, score, keypoints in model.predict([img]):
            # Draw the box around the face...
            ml.utils.draw_predictions(img, [rect], ("face",),
                                      ((0, 0, 255),), format=None)
            # ...and mark the six landmarks: eyes, nose, mouth, ears.
            ml.utils.draw_keypoints(img, keypoints, color=(255, 0, 0))

        print(clock.fps(), "fps")

Press the green **Run** button and point the camera at a face. The
frame buffer viewer draws a box around each face and marks the eyes,
nose, mouth, and ears, while the serial terminal prints the frame
rate.

This script -- and one for nearly every feature the camera has -- is
also built into the IDE under **File → Examples**, filtered to your
connected board. Open one, press run, and start exploring what the
camera can do.

Where to go next
----------------

Where you jump in depends on what you already know. The tutorial has
three starting points -- new to Python, new to hardware, or ready for
machine vision -- so pick the one that fits. The references and the
IDE guide are here whenever you need them.

.. raw:: html

   <div class="next-steps">
     <a class="next-step-card icon-green" href="python/index.html">
       <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg></div>
       <h4>New to Python</h4>
       <p>Learn the language from the ground up, running on the camera.</p>
       <span class="card-arrow">Python Overview &rarr;</span>
     </a>
     <a class="next-step-card icon-amber" href="hardware/index.html">
       <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg></div>
       <h4>New to hardware</h4>
       <p>Know Python? Drive pins, buses, and timing from MicroPython.</p>
       <span class="card-arrow">Hardware Control &rarr;</span>
     </a>
     <a class="next-step-card icon-coral" href="vision/index.html">
       <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
       <h4>Ready for machine vision</h4>
       <p>Know Python and hardware? Jump to the imaging stack and vision tools.</p>
       <span class="card-arrow">Vision Sensors &rarr;</span>
     </a>
     <a class="next-step-card icon-purple" href="../quickref.html">
       <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div>
       <h4>Board reference</h4>
       <p>Pinouts, specs, and quick references for every OpenMV Cam.</p>
       <span class="card-arrow">Find your board &rarr;</span>
     </a>
     <a class="next-step-card icon-blue" href="../../library/index.html">
       <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg></div>
       <h4>Library reference</h4>
       <p>Every module the camera exposes, documented call by call.</p>
       <span class="card-arrow">Open the reference &rarr;</span>
     </a>
     <a class="next-step-card icon-green" href="tools/ide/index.html">
       <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
       <h4>Master OpenMV IDE</h4>
       <p>The editor, live frame buffer, example library, and camera tools, in depth.</p>
       <span class="card-arrow">Open the chapter &rarr;</span>
     </a>
   </div>
