Full example
============

*Create Default Config* writes the file below and opens
it. It is a demo -- not a real device config -- built to
exercise every control type at once: labels, both kinds
of container, all seven value controls, the
*options*/*values* mapping, a tristate checkbox, a hex
spinbox, an input mask, a regex, a password field, and a
disabled field. Read it alongside the reference pages to
see each key in context, then strip it down to the
settings your own application needs.

.. code-block:: json

   {
     "title": "Camera Settings",
     "controls": [
       {
         "type": "label",
         "align": "center",
         "text": "<b>This is a demo configuration.</b><br/>The controls below are examples that show off every setting type you can build &mdash; they are <i>not</i> a real device config. Replace them with the controls your own application needs, then edit the values, click <b>Save</b>, and read them back in your script with <code>json.load()</code>. See the <a href='https://docs.openmv.io'>documentation</a> for details."
       },
       {
         "type": "tabs",
         "tab_position": "north",
         "tabs": [
           {
             "title": "Camera",
             "tooltip": "Sensor and capture settings",
             "controls": [
               { "type": "label", "text": "<b>Image capture</b>" },
               {
                 "type": "group",
                 "title": "Manual Exposure",
                 "checkable": true,
                 "name": "manual_exposure",
                 "value": false,
                 "controls": [
                   { "type": "slider", "name": "exposure_us", "label": "Exposure", "value": 10000, "min": 0, "max": 33000, "step": 100, "suffix": " us", "ticks": 5500, "tooltip": "Shutter time in microseconds" },
                   { "type": "slider", "name": "gain_db", "label": "Gain", "value": 8, "min": 0, "max": 24, "suffix": " dB", "ticks": 4 }
                 ]
               },
               {
                 "type": "group",
                 "title": "Format",
                 "controls": [
                   { "type": "combobox", "name": "resolution", "label": "Resolution", "value": "qvga", "options": ["QQVGA", "QVGA", "VGA"], "values": ["qqvga", "qvga", "vga"] },
                   { "type": "combobox", "name": "pixformat", "label": "Pixel Format", "value": 1, "options": ["Grayscale", "RGB565"] },
                   { "type": "checkbox", "name": "h_mirror", "label": "Horizontal Mirror", "value": false },
                   { "type": "checkbox", "name": "v_flip", "label": "Vertical Flip", "value": false },
                   { "type": "slider", "name": "digital_zoom", "label": "Digital Zoom", "value": 1, "min": 1, "max": 8, "prefix": "x", "ticks": 1 }
                 ]
               }
             ]
           },
           {
             "title": "Processing",
             "tooltip": "Detection and overlays",
             "controls": [
               {
                 "type": "group",
                 "title": "Detection",
                 "controls": [
                   { "type": "radio", "name": "mode", "label": "Mode", "value": "idle", "options": ["Idle", "Track", "Record"], "values": ["idle", "track", "record"], "orientation": "horizontal" },
                   { "type": "slider", "name": "threshold", "label": "<b>Threshold</b>", "value": 50, "min": 0, "max": 100, "suffix": " %", "ticks": 25 },
                   { "type": "spinbox", "name": "min_area", "label": "Min Area", "value": 100, "min": 0, "max": 10000, "suffix": " px", "special_value_text": "Off", "group_separator": true },
                   { "type": "doublespinbox", "name": "sensitivity", "label": "Sensitivity", "value": 50, "min": 0, "max": 100, "step": 0.5, "decimals": 1, "suffix": " %", "special_value_text": "Auto" },
                   { "type": "checkbox", "name": "draw_overlays", "label": "Draw Overlays", "value": true }
                 ]
               },
               {
                 "type": "group",
                 "title": "Recording",
                 "controls": [
                   { "type": "radio", "name": "quality", "label": "Quality", "value": 1, "options": ["Low", "Medium", "High"] },
                   { "type": "checkbox", "name": "capture_mode", "label": "Capture (off / single / continuous)", "tristate": true, "value": 1 }
                 ]
               }
             ]
           },
           {
             "title": "Network",
             "tooltip": "Wi-Fi and server",
             "controls": [
               { "type": "label", "text": "<i>Network configuration</i>" },
               {
                 "type": "group",
                 "title": "Wi-Fi",
                 "checkable": true,
                 "name": "wifi_enabled",
                 "value": true,
                 "controls": [
                   { "type": "lineedit", "name": "wifi_ssid", "label": "SSID", "value": "", "placeholder": "Network name", "max_length": 32, "clear_button": true },
                   { "type": "lineedit", "name": "wifi_password", "label": "Password", "value": "", "password": true, "clear_button": true },
                   { "type": "lineedit", "name": "static_ip", "label": "Static IP", "value": "192.168.001.100", "mask": "000.000.000.000;_", "tooltip": "Set to 0.0.0.0 for DHCP" }
                 ]
               },
               {
                 "type": "group",
                 "title": "Server",
                 "controls": [
                   { "type": "spinbox", "name": "server_port", "label": "Port", "value": 8080, "min": 0, "max": 65535, "group_separator": true },
                   { "type": "lineedit", "name": "hostname", "label": "Hostname", "value": "openmv-cam", "regex": "[A-Za-z0-9-]+", "placeholder": "letters, digits, dashes", "clear_button": true }
                 ]
               }
             ]
           },
           {
             "title": "System",
             "tooltip": "Device and power",
             "controls": [
               {
                 "type": "group",
                 "title": "Device",
                 "controls": [
                   { "type": "lineedit", "name": "device_name", "label": "Device Name", "value": "openmv-cam", "clear_button": true },
                   { "type": "combobox", "name": "led", "label": "LED", "value": 0, "options": ["Off", "Red", "Green", "Blue"] },
                   { "type": "spinbox", "name": "i2c_address", "label": "I2C Address", "value": 48, "min": 0, "max": 255, "base": 16, "prefix": "0x" },
                   { "type": "lineedit", "name": "firmware", "label": "Firmware", "value": "4.5.0", "enabled": false }
                 ]
               },
               {
                 "type": "group",
                 "title": "Power",
                 "controls": [
                   { "type": "radio", "name": "power_mode", "label": "Power Mode", "value": "balanced", "options": ["Performance", "Balanced", "Low Power"], "values": ["perf", "balanced", "low"] },
                   { "type": "slider", "name": "led_brightness", "label": "LED Brightness", "value": 80, "min": 0, "max": 100, "suffix": " %", "ticks": 20 }
                 ]
               },
               {
                 "type": "group",
                 "title": "Storage",
                 "controls": [
                   { "type": "doublespinbox", "name": "storage_limit", "label": "Storage Limit", "value": 1024.5, "min": 0, "max": 65536, "step": 0.5, "decimals": 1, "prefix": "max ", "suffix": " MB", "group_separator": true }
                 ]
               }
             ]
           }
         ]
       },
       {
         "type": "label",
         "align": "right",
         "text": "<i>Edit the values, then click Save.</i>"
       }
     ]
   }

Reading it back
---------------

You authored this layout, so you know the path to each
value. With the ``find`` helper from the
:doc:`overview <index>`, name the tab and the control --
``find`` steps through the tab strip and any unnamed
group in between:

.. code-block:: python

   enabled = find(config, "Camera", "manual_exposure")["value"]                   # the group's checkbox
   exposure = find(config, "Camera", "manual_exposure", "exposure_us")["value"]   # 10000
   resolution = find(config, "Camera", "resolution")["value"]                     # "qvga"

The *Manual Exposure* group has a *name*, so it is a step
in the path -- and ``find(config, "Camera",
"manual_exposure")`` reads its checkbox. The *Format*
group has no *name*, so it is transparent: ``resolution``
is reached straight from the *Camera* tab.

Note how the *combobox* with a *values* array returns
the stored value (``"qvga"``), not the label the user
picked (``"QVGA"``) -- exactly what a script wants to
branch on.
