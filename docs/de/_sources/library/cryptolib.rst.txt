:mod:`cryptolib` --- cryptographic ciphers
==========================================

.. module:: cryptolib
   :synopsis: cryptographic ciphers

The :mod:`cryptolib` module provides symmetric-cipher primitives. On
OpenMV Cams it is included whenever the :mod:`ssl` module is enabled.

Classes
-------

.. class:: aes(key: Union[bytes, bytearray, memoryview], mode: int, IV: Optional[Union[bytes, bytearray, memoryview]] = None)

    Create a new AES cipher object, suitable for encryption or decryption.
    After initialisation, the cipher object can be used only for one
    direction --- running ``decrypt()`` after ``encrypt()`` (or vice
    versa) is not supported.

    Parameters:

    - ``key`` -- the encryption/decryption key. Must be exactly 16 bytes
      (AES-128) or 32 bytes (AES-256); AES-192 is not supported. Any
      buffer-protocol object is accepted.
    - ``mode`` -- selects the block-cipher mode:

      .. list-table::
         :header-rows: 1
         :widths: 14 24 62

         * - Value
           - Name
           - Description
         * - ``1``
           - ECB
           - Electronic Code Book. Each 16-byte block is encrypted
             independently; identical plaintext blocks produce identical
             ciphertext. Generally not recommended for new designs.
         * - ``2``
           - CBC
           - Cipher Block Chaining. Each block is XORed with the previous
             ciphertext block before encryption. Requires a 16-byte
             ``IV``.

      ECB and CBC both require the input length to be a multiple of the
      16-byte AES block size.

    - ``IV`` -- the 16-byte initialisation vector for CBC mode. Ignored
      for ECB.

    .. method:: encrypt(in_buf: Union[bytes, bytearray, memoryview], out_buf: Optional[Union[bytearray, memoryview]] = None) -> bytes

        Encrypt ``in_buf``. The buffer length must be a multiple of 16
        bytes; pad the plaintext yourself before calling.

        If ``out_buf`` is omitted the result is returned as a newly
        allocated :class:`bytes` object. Otherwise the ciphertext is
        written into the mutable buffer ``out_buf``, which must be at
        least as long as ``in_buf``. ``in_buf`` and ``out_buf`` may refer
        to the same buffer for in-place encryption.

    .. method:: decrypt(in_buf: Union[bytes, bytearray, memoryview], out_buf: Optional[Union[bytearray, memoryview]] = None) -> bytes

        Like :meth:`encrypt`, but reverses the operation.
