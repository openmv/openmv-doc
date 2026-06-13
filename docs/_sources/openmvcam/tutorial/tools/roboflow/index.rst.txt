Roboflow
========

.. raw:: html

   <video width="100%" autoplay loop muted playsinline
          poster="https://cdn.prod.website-files.com/5f6bc60e665f54545a1e52a5/699f8314ce713d3da88c4be2_hero-homepage-2026-1440x810-cover.avif"
          style="border-radius: 8px; margin-bottom: 1.5rem; display: block;"
          aria-label="A Roboflow object detector labelling parts on an inspection line">
     <source src="https://media.roboflow.com/webflow/video/hero-homepage-202-1440x810-short.mp4" type="video/mp4">
   </video>

`Roboflow <https://roboflow.com/>`__ takes you from raw footage to a
trained, production-ready computer-vision model without writing a
line of training code -- all in the browser, on their servers.
OpenMV is one of its deploy targets: when training finishes, one
button downloads integer-quantized TFLite weights ready for the
camera. Roboflow's own `documentation <https://docs.roboflow.com/>`__
goes deeper on every step.

.. toctree::
   :caption: Building the dataset
   :maxdepth: 1

   create-project.rst
   upload-footage.rst
   label.rst

.. toctree::
   :caption: Training and deployment
   :maxdepth: 1

   train.rst
   deploy.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
