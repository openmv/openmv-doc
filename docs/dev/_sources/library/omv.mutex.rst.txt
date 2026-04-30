:mod:`mutex` --- mutex module
=============================

.. module:: mutex
   :synopsis: mutex module

The ``mutex`` module provides a mutual-exclusion primitive for protecting
critical sections of code or shared data from concurrent access by an interrupt
service routine and the main thread.

Lock acquisition and release is performed via a context manager (``with``
statement), which blocks until the mutex is available. A non-blocking
:meth:`Mutex.test` method is also provided.


class Mutex -- mutex object
---------------------------

.. class:: Mutex()

   Creates an unlocked mutex object.

   .. method:: release() -> None

      Unlock the mutex. Raises `mutex.MutexException` if the mutex is not
      currently locked.

   .. method:: test() -> bool

      Try to acquire the mutex in a non-blocking way. Returns ``True`` on success
      and ``False`` if the mutex is already locked.

      To acquire the mutex in a blocking way, use the instance as a context
      manager (``with`` statement). The mutex is released automatically on exit.

Exceptions
----------

.. exception:: MutexException

   Subclass of ``OSError``. Raised by `Mutex.release` when the mutex is
   already unlocked.
