:mod:`random` --- generate random numbers
=========================================

.. module:: random
   :synopsis: random numbers

This module implements a pseudo-random number generator (PRNG). The
PRNG is a 32-bit *Yasmarang*-style LCG; on first import it draws one
32-bit seed from the same hardware source :func:`os.urandom` uses,
and every subsequent number is a deterministic function of that
seed.

.. warning::

   The output is not cryptographically secure -- the algorithm is
   predictable from a short output sequence, and the initial seed
   carries only 32 bits of entropy. For keying material, session
   tokens, password salts, or any other security-sensitive use,
   call :func:`os.urandom` instead.

.. note::

   The following notation is used for intervals:

   - () are open interval brackets and do not include their endpoints.
     For example, (0, 1) means greater than 0 and less than 1.
     In set notation: (0, 1) = {x | 0 < x < 1}.

   - [] are closed interval brackets which include all their limit points.
     For example, [0, 1] means greater than or equal to 0 and less than
     or equal to 1.
     In set notation: [0, 1] = {x | 0 <= x <= 1}.


Functions for integers
----------------------

.. function:: getrandbits(n: int) -> int

    Return an integer with *n* random bits (0 <= n <= 32).

.. function:: randint(a: int, b: int) -> int

    Return a random integer in the range [*a*, *b*].

.. function:: randrange(start: int, stop: Optional[int] = None, step: int = 1) -> int

    The first form returns a random integer from the range [0, *stop*).
    The second form returns a random integer from the range [*start*, *stop*).
    The third form returns a random integer from the range [*start*, *stop*) in
    steps of *step*.  For instance, calling ``randrange(1, 10, 2)`` will
    return odd numbers between 1 and 9 inclusive.


Functions for floats
--------------------

.. function:: random() -> float

    Return a random floating point number in the range [0.0, 1.0).

.. function:: uniform(a: float, b: float) -> float

    Return a random floating point number N such that *a* <= N <= *b* for *a* <= *b*,
    and *b* <= N <= *a* for *b* < *a*.


Other Functions
---------------

.. function:: seed(n: Optional[int] = None, /) -> None

    Initialise the random number generator module with the seed *n*,
    which should be an integer. When no argument (or :data:`None`) is
    passed in, the PRNG is re-seeded from the same port-specific
    source :func:`os.urandom` uses.

.. function:: choice(sequence: Any) -> Any

    Chooses and returns one item at random from *sequence* (tuple, list or
    any object that supports the subscript operation).
