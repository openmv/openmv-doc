Scope
=====

When Python looks up a name inside a function, it searches a
specific sequence of *scopes*. Understanding that sequence
explains why some assignments shadow outer names, why others
modify them, and why nested functions can remember values from
where they were defined.

.. figure:: ../figures/scope-frames.svg
   :alt: Nested boxes showing a local scope inside a module scope
         inside the built-in scope, with an arrow indicating that
         name lookup walks outward from the innermost frame.

   Name lookup starts in the local function scope and walks
   outward to module and built-in scopes until a match is found.

Local and module scope
----------------------

Names defined inside a function are *local* to that function and
disappear when the call ends:

::

    def f():
        x = 10
        print(x)

    f()
    print(x)              # NameError: x is not defined

Names defined at the top level of a ``.py`` file are *module-level*
(sometimes called *global*) and are visible everywhere in that
file, including inside functions:

::

    CAMERA = "OpenMV"

    def banner():
        print("running on", CAMERA)

Reading a module-level name from inside a function is automatic.
*Assigning* to that name from inside a function is not -- the
assignment creates a new local variable that shadows the
module-level one for the rest of the call:

::

    counter = 0

    def bump():
        counter = counter + 1     # UnboundLocalError

The left-hand ``counter`` makes ``counter`` a local name in
``bump``, so the read on the right has no value to find.

The global keyword
~~~~~~~~~~~~~~~~~~

To actually reassign a module-level name from inside a function,
declare it ``global`` first:

::

    counter = 0

    def bump():
        global counter
        counter += 1

Reach for ``global`` sparingly. Functions that mutate hidden
state are harder to reason about than functions that take values
in as arguments and return new values out. The usual fix for "I
need to share state" is to pass an object (a list, a dict, a class
instance) as an argument and mutate *it* instead.

Lambdas
-------

A ``lambda`` builds a small anonymous function in a single
expression:

::

    square = lambda x: x * x
    square(7)             # 49

It is exactly equivalent to ::

    def square(x):
        return x * x

The body of a ``lambda`` must be a single expression -- no
statements, no multiple lines. The main use is passing a tiny
function as an argument to something that takes a function:

::

    pairs = [("b", 2), ("a", 3), ("c", 1)]
    pairs.sort(key=lambda item: item[1])
    # [('c', 1), ('b', 2), ('a', 3)]

When the body grows past one expression, switch to a real ``def``.
Naming a function with ``def`` also gives it a name in tracebacks,
which a ``lambda`` does not have.

Closures
--------

A function defined inside another function can read names from
the enclosing function's scope. The inner function *captures*
those names and keeps working even after the outer call has
returned:

::

    def make_adder(n):
        def add(x):
            return x + n
        return add

    add5 = make_adder(5)
    add10 = make_adder(10)
    print(add5(100), add10(100))

Output::

    105 110

``add5`` and ``add10`` are two separate functions, each
remembering its own ``n``. A function that builds and returns
a customised inner function this way is called a *closure*. It is
the main reason a language needs nested functions in the first
place -- a way to bake some state into a function value and then
hand that value off as a single callable.

Reading captured names happens automatically. *Rebinding* one
needs an extra keyword. The example below does what looks right
and fails:

::

    def make_counter():
        count = 0
        def tick():
            count = count + 1     # UnboundLocalError
            return count
        return tick

The assignment to ``count`` inside ``tick`` makes ``count`` local
to ``tick``, the same way it would have made it local in a
top-level function. The ``nonlocal`` keyword tells Python "this
name lives in the enclosing function, rebind it there":

::

    def make_counter():
        count = 0
        def tick():
            nonlocal count
            count += 1
            return count
        return tick

    c = make_counter()
    print(c(), c(), c())

Output::

    1 2 3

``nonlocal`` is to enclosing-function scope what ``global`` is to
module scope. Note that *mutating* a captured object (calling
``some_list.append(...)``, ``some_dict[k] = v``) does not need
``nonlocal`` -- the name is not being rebound, only the object it
points at is being changed.
