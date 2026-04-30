:mod:`cryptolib` -- cryptographic ciphers
=========================================

.. module:: cryptolib
   :synopsis: cryptographic ciphers

Classes
-------

.. class:: aes(key: Union[bytes, bytearray, memoryview], mode: int, IV: Optional[Union[bytes, bytearray, memoryview]] = None)

    Create a new AES cipher object, suitable for encryption or decryption.
    After initialization, the cipher object can be used only for one
    direction — running ``decrypt()`` after ``encrypt()`` (or vice versa)
    is not supported.

    Parameters are:

        * *key* is an encryption/decryption key (bytes-like).
        * *mode* is:

            * ``1`` (or ``cryptolib.MODE_ECB`` if it exists) for Electronic Code Book (ECB).
            * ``2`` (or ``cryptolib.MODE_CBC`` if it exists) for Cipher Block Chaining (CBC).
            * ``6`` (or ``cryptolib.MODE_CTR`` if it exists) for Counter mode (CTR).

        * *IV* is an initialization vector for CBC mode.
        * For Counter mode, *IV* is the initial value for the counter.

    .. method:: encrypt(in_buf: Union[bytes, bytearray, memoryview], out_buf: Optional[Union[bytearray, memoryview]] = None) -> bytes

        Encrypt *in_buf*. If no *out_buf* is given result is returned as a
        newly allocated `bytes` object. Otherwise, result is written into
        mutable buffer *out_buf*. *in_buf* and *out_buf* can also refer
        to the same mutable buffer, in which case data is encrypted in-place.

    .. method:: decrypt(in_buf: Union[bytes, bytearray, memoryview], out_buf: Optional[Union[bytearray, memoryview]] = None) -> bytes

        Like `encrypt()`, but for decryption.
