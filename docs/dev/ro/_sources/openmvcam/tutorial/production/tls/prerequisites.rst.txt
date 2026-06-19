Prerequisites: OpenSSL and the clock
====================================

Two pieces have to be in place before any of the
hands-on pages will work: the OpenSSL command-line tool
on your development machine, and a correct clock on the
camera at the moment of every TLS handshake.

Installing OpenSSL
------------------

The commands in this section use the ``openssl``
command-line tool, run on your development machine --
not on the camera. It is often already installed; check
with::

    openssl version

If it is missing, install it for your operating system:

* **Linux** -- use the package manager, e.g.
  ``sudo apt install openssl`` (Debian/Ubuntu),
  ``sudo dnf install openssl`` (Fedora/RHEL) or
  ``sudo pacman -S openssl`` (Arch).
* **macOS** -- ``brew install openssl`` using
  `Homebrew <https://brew.sh>`__.
* **Windows** -- install a build such as `Win32/Win64
  OpenSSL <https://slproweb.com/products/Win32OpenSSL.html>`__,
  use a package manager
  (``winget install ShiningLight.OpenSSL.Light`` or
  ``choco install openssl``), or use the ``openssl``
  that ships with `Git for Windows
  <https://git-scm.com/download/win>`__ (run it from
  Git Bash).

Setting the clock
-----------------

:data:`ssl.CERT_REQUIRED` checks each certificate's
validity period, so the camera's clock must be correct
or verification fails (a freshly powered-up camera has
no idea what time it is). With a working network
connection, the :mod:`ntptime` module fetches the time
over NTP and sets the on-board RTC
(:class:`machine.RTC`), in UTC::

    import ntptime

    ntptime.settime()                 # query NTP and set machine.RTC (UTC)

After this, :func:`time.localtime` and
:class:`machine.RTC` reflect the current UTC time.
Bringing the network interface up is board-specific and
is not shown here; the examples on the following pages
assume the camera is already connected.
