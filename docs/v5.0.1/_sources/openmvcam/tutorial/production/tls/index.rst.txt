.. _tls_certificates:

Working with TLS certificates
=============================

The :mod:`ssl` module on the OpenMV Cam (built on
mbedTLS) lets a script make encrypted, authenticated
network connections. To do anything beyond plain
encryption you need certificates. The pages in this
section cover what they are, which key types and file
formats the camera accepts, how to create self-signed
certificates for development and obtain CA-signed ones
for production, how to get them onto the camera and
verify a remote server, how to protect the private key,
and how certificate expiry and rotation affect a
deployed device.

.. toctree::
   :maxdepth: 1

   concepts.rst
   prerequisites.rst
   self-signed.rst
   ca-signed.rst
   as-client.rst
   operations.rst
