Third-party repositories
========================

The IDE ships OpenMV's own boards, firmware, examples,
machine-learning models, and editor stubs, but it can
load the same kinds of content from other companies as
well -- a board a partner built, the firmware that runs
on it, examples and models tuned for it, and code
completion for the APIs that firmware adds. These arrive
as *third-party repositories*: folders of content the
IDE merges with its own and keeps up to date.

This page has two audiences. Most of it is for the
person installing and managing a repository someone else
published. The last section, :ref:`authoring a
repository <authoring-a-repository>`, is for the vendor
building one.

The Third Party Repositories page
---------------------------------

Everything is managed from Edit → Preferences → OpenMV →
Third Party Repositories. The table lists every installed
repository and, for each, its display name, its short
id, whether it is *Built-in* or *User*, the installed
version of each kind of content it provides -- firmware,
examples, models, stubs -- and the URL it updates from.

*Built-in* means the repository was placed into the
application's own directory by an installer the vendor
shipped, the way a driver package adds files to a
program. *User* means you installed it yourself from a
URL. The only practical difference is that you cannot
remove a built-in repository from the IDE -- it is
removed by uninstalling whatever put it there -- so the
Remove button is disabled for it.

Installing a repository
-----------------------

Install from URL asks for the address of a repository's
``config.json`` -- the small manifest file the vendor
publishes -- and installs everything it points to. Paste
the URL the vendor gave you; the IDE downloads the
manifest, fetches the firmware, examples, models, and
stubs it lists, and verifies each download. Installing,
removing, and updating a repository all take effect after
a restart, so the IDE offers to restart when the install
finishes.

A vendor can also distribute a repository as an installer
that drops it straight into the application directory, in
which case it is simply present as a *Built-in* row the
first time you open the page -- nothing to install.

Keeping repositories updated
----------------------------

A repository that carries an update URL is checked each
time the IDE launches. When newer content is available
the IDE tells you what -- listing each repository and the
versions involved -- and offers to install it, all in a
single prompt. Check for Updates runs the same check on
demand.

Priority and overrides
----------------------

Repositories are an ordered list, highest priority at the
top, and Move Up and Move Down reorder the selected one.
Order matters only when two sources provide the *same*
thing: a board with the same USB identifier, or an
example, model, or stub with the same name. When that
happens the higher entry wins, and every repository wins
over OpenMV's built-in content. This is deliberate -- it
is how a vendor supplies their own firmware for a board
that shares an OpenMV board's USB identifier, replacing
the stock firmware the IDE would otherwise offer for it,
or replaces a stock example with one written for their
hardware.

Because an override silently changes what a familiar name
does, the page never hides one. The Override warnings
panel lists every override in effect -- which
repository's board, example, model, or stub is
overriding which -- and the same list appears once as a
message the first time a repository is seen. If a board,
example, or model is not behaving the way OpenMV's
documentation describes, this panel is the first place to
look.

What a repository provides
--------------------------

The four kinds of content each appear in their usual
place in the IDE, so once a repository is installed there
is nothing new to learn:

- **Boards and firmware.** A repository's board behaves
  exactly like an OpenMV board -- it is recognized on
  connect, its type shows in the status bar, and its
  firmware updates through the IDE, including the Install
  the Latest Development Release path. See :doc:`firmware`.

- **Examples.** A repository's examples appear in
  File → Examples, merged into the category tree: an
  example in a category the vendor named the same as an
  OpenMV category sits alongside the OpenMV ones, and a
  new category becomes its own submenu. They are filtered
  to the boards they support like any example. See
  :doc:`scripts-and-examples`.

- **Models.** A repository's models appear in the
  :doc:`Model Zoo <model-zoo>`, merged into the browser
  tree the same way, with the vendor's own descriptions.

- **Stubs.** A repository can ship ``.pyi`` stub files so
  the :doc:`editor <editor>` offers completion, signatures,
  and documentation for the functions its firmware adds --
  the same completion you get for OpenMV's own modules,
  for a vendor's custom API.

.. _authoring-a-repository:

Authoring a repository
----------------------

A repository is a folder named for the vendor, holding a
``config.json`` manifest and a subfolder for each kind of
content it provides:

.. code-block:: text

   acme/
     config.json
     firmware/
       settings.json                 board descriptions
       ACME_CAM1/                    one folder per board, named by boardFirmwareFolder
         firmware.bin
         romfs0.img
     firmware.version
     examples/
       index.csv                     which examples show for which board / sensor
       01-Getting-Started/           numbered category folders, same as OpenMV's
         hello_acme.py
         read_sensor.py
       02-Acme-Widgets/
         spin_widget.py
     examples.version
     models/
       index.csv                     which models show for which board
       acme/                         a group; its index.html + image describe it
         index.html
         image.jpg
         person_detector/            one folder per model
           person_detector.tflite
           person_detector.txt       class labels
     models.version
     stubs/
       acme_hal.pyi                  a module the firmware adds
       csi.pyi                       overrides OpenMV's to add methods
     stubs.version

The folder name is the repository id: lowercase letters,
digits, ``-`` and ``_``, starting with a letter. Every
part folder is optional; ship only what you have. Beside
each part folder is a ``<part>.version`` file holding a
single version string (``1.2.0``) that the IDE uses to
decide when an update is newer.

The manifest
~~~~~~~~~~~~

``config.json`` names the repository and, for each part,
points at a downloadable archive:

.. code-block:: json

   {
     "name": "acme",
     "displayName": "Acme Robotics",
     "homepage": "https://acme.example",
     "configUrl": "https://acme.example/openmv/config.json",
     "firmware": {
       "release":     { "version": "1.2.0", "url": "https://acme.example/acme-fw-1.2.0.zip", "sha256": "..." },
       "development": { "version": "dev-20260701", "url": "https://acme.example/acme-fw-dev.zip", "sha256": "..." }
     },
     "examples": { "release": { "version": "1.1.0", "url": "https://acme.example/acme-examples-1.1.0.zip", "sha256": "..." } },
     "models":   { "release": { "version": "1.0.0", "url": "https://acme.example/acme-models-1.0.0.zip", "sha256": "..." } },
     "stubs":    { "release": { "version": "1.0.0", "url": "https://acme.example/acme-stubs-1.0.0.zip", "sha256": "..." } }
   }

``name`` must match the folder name. ``configUrl`` is the
address this same file is hosted at; the IDE re-fetches it
to check for updates, so omit it only for a repository
that will never update. Each part has a ``release``
channel, and firmware may also have a ``development``
channel used by Install the Latest Development Release.
Release ``version`` values are compared as numbers, so a
higher one is offered as an update; development versions
are compared only for change. The ``sha256`` is optional
but is verified when present.

Each ``url`` points at a ``.zip`` (zip only). An archive
holds exactly **one top-level folder**, and the IDE
installs that folder's *contents* as the part -- so the
firmware archive is packaged like this:

.. code-block:: text

   acme-fw-1.2.0.zip
     acme-firmware/           one wrapping folder; its name does not matter
       settings.json
       ACME_CAM1/
         firmware.bin
         romfs0.img

and unpacks to the ``firmware/`` folder shown earlier. The
examples, models, and stubs archives are packaged the same
way -- one wrapping folder holding what would sit inside
``examples/``, ``models/``, or ``stubs/``. The wrapping
folder's name is ignored; what matters is that there is
exactly one. Zipping the files at the archive root with no
wrapping folder, or wrapping them in more than one folder,
will not install. The simplest way to get it right is to
zip the folder itself -- select ``acme-firmware`` and
compress it, rather than selecting its contents.

Boards, examples, models, and stubs
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``firmware/settings.json`` uses the same board-description
format as the firmware the IDE ships; add a ``boards``
entry for each of your boards. A few rules are specific to
third-party boards: ``boardFirmwareFolder`` must be unique
(it is not yet used by OpenMV or another vendor, since it
names the folder your binaries live in), each board must
carry its own ``firmware_version`` (this is what drives
the update-on-connect prompt), and a board may set
``boardFirmwareFolderAlias`` to an OpenMV board's
firmware-folder name to inherit that board's stock examples
and models -- the escape hatch for a board that is
firmware-compatible with an OpenMV one. Reusing OpenMV
bootloader identifiers
is expected (they carry the signed Windows drivers); an
app identifier that collides with a built-in board
overrides that board, which the Override warnings panel
reports.

Examples go in numbered category folders like OpenMV's
(``01-Getting-Started``); a category you name the same as
an OpenMV one interleaves into it, and a new name becomes
its own menu section. A model is a folder holding its
``.tflite`` and a matching ``.txt`` of class labels,
grouped under a folder whose ``index.html`` (and an
optional image) is the description shown beside it in the
Model Zoo. ``examples/index.csv`` and ``models/index.csv``
are the same board- and sensor-filter files OpenMV's own
examples and models use, matched against your example and
model paths, and decide which of yours show for which
board. Stubs are ordinary ``.pyi`` files; the IDE hands
their folder to the language server so they resolve
alongside OpenMV's, and a stub named for an existing
module (``csi.pyi``) overrides that module's completion.

Publishing and updating
~~~~~~~~~~~~~~~~~~~~~~~~~

To publish, host the ``config.json`` and the archives it
references at stable URLs and give users the
``config.json`` URL to install from. Anywhere that serves
plain files over HTTPS works -- a web server, an object
store, or a code host. To ship an update, upload new
archives, bump the affected ``version`` values in the
hosted ``config.json``, and the next time each user's IDE
launches it offers the update. Users who installed the
repository through an installer instead get updates the
same way, as long as the installed ``config.json`` carries
a ``configUrl``.

Hosting on GitHub
~~~~~~~~~~~~~~~~~

GitHub is a convenient host, and the IDE fetches from it
the same way it fetches its own resources. There are two
pieces to place: the manifest and the archives.

Keep the ``config.json`` in a repository and give users
its *raw* URL -- the address the file is served at
directly, not the GitHub page that displays it. The Raw
button on the file shows it; it has the form

.. code-block:: text

   https://raw.githubusercontent.com/<user>/<repo>/<branch>/config.json

That raw URL is what a user pastes into Install from URL,
and what you put in the manifest's own ``configUrl`` so
the IDE re-fetches it to check for updates. Pointing it at
a branch (``main``) means pushing a new commit publishes
the change; pointing it at a tag pins users to a fixed
version instead.

Host the ``.zip`` archives as **release assets** rather
than committing them -- releases are built for binary
downloads, so a multi-megabyte firmware bundle belongs
there, not in the repository's history. Attach each
archive to a GitHub release and use its download URL,
which has the form

.. code-block:: text

   https://github.com/<user>/<repo>/releases/download/<tag>/acme-fw-1.2.0.zip

in the manifest's ``url`` fields, each with the archive's
``sha256``. Shipping an update is then: attach the new
archives to a release, edit ``config.json`` to point at
them and bump the versions, and commit. The IDE picks up
the change on its next launch (the raw file is served
through a cache that refreshes within a few minutes of the
push).
