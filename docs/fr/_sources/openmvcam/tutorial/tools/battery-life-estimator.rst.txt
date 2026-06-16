Battery Life Estimator
======================

Every OpenMV camera can run on a battery. Cameras that support deep-sleep
drop the system into the low-µA range when the firmware is idle, so by
cycling between brief bursts of activity and long stretches of deep sleep
they can run for weeks, months, or even years between charges.

The calculator below takes your board / shield / power interface, a duty
cycle (active vs. deep-sleep time per cycle), and a battery, and gives back
an estimated runtime. Plug in your numbers and iterate to size a battery
for your application -- or to decide what duty cycle you need to hit a
required deployment time.

.. raw:: html

   <iframe id="openmv-battery-life-iframe"
           src="../../../_static/battery_life/index.html"
           title="OpenMV Battery Life Estimator"
           loading="lazy"
           scrolling="no"
           style="width: 100%; height: 0; border: 0; display: block;
                  background: transparent; overflow: hidden;"></iframe>
   <script>
     window.addEventListener("message", function (e) {
       if (e.data && e.data.type === "openmv-battery-life-height") {
         var f = document.getElementById("openmv-battery-life-iframe");
         if (f) f.style.height = e.data.height + "px";
       }
     });
   </script>
