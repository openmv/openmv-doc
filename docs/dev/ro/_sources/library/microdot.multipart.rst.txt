:mod:`microdot.multipart` --- multipart/form-data parsing
=========================================================

.. module:: microdot.multipart
   :synopsis: multipart/form-data body parser for Microdot

Parses ``Content-Type: multipart/form-data`` request bodies -- the
encoding browsers use for forms that include ``<input type="file">``
fields. Two flavors of API:

* A streaming :class:`FormDataIter` that yields fields one at a time --
  useful when the application has to handle very large uploads piece
  by piece on a memory-constrained device.
* A :func:`with_form_data` decorator that buffers everything and
  populates :attr:`request.form <microdot.Request.form>` /
  :attr:`request.files <microdot.Request.files>` -- the convenient API
  for normal-sized uploads.

class FormDataIter
------------------

.. class:: FormDataIter(request)

   Async iterator over the parts of *request*'s multipart body.
   Yielded values are ``(name, value)`` tuples; *value* is a ``str``
   for regular fields and a :class:`FileUpload` for file fields.

   Used directly when memory matters more than ergonomics::

       from microdot.multipart import FormDataIter, FileUpload

       @app.post('/upload')
       async def upload(request):
           async for name, value in FormDataIter(request):
               if isinstance(value, FileUpload):
                   await value.save('/sdcard/' + value.filename)
               else:
                   print(name, '=', value)
           return 'ok'

   .. note::

      When iterating over file fields, the file must be consumed
      (via :meth:`FileUpload.read` or :meth:`FileUpload.save`) before
      the next ``async for`` iteration -- the underlying stream is
      invalidated when iteration advances.

   .. attribute:: buffer_size
      :type: int

      Class attribute. Chunk size used while reading from the request
      stream. Default 256 bytes. Increase for higher throughput at the
      cost of RAM.

class FileUpload
----------------

.. class:: FileUpload(filename: str, content_type: str | None, read)

   A single uploaded file. Instances are yielded by
   :class:`FormDataIter` and collected into
   :attr:`request.files <microdot.Request.files>` by
   :func:`with_form_data`. Applications do not normally construct
   :class:`FileUpload` directly.

   .. attribute:: filename
      :type: str

      The file's original name as the client sent it (untrusted -- do
      not pass to :func:`open` without sanitizing).

   .. attribute:: content_type
      :type: str | None

      The MIME type from the part's ``Content-Type`` header, or
      ``None`` if not provided.

   .. attribute:: max_memory_size
      :type: int

      Class attribute. Threshold (in bytes) above which
      :meth:`copy` switches from in-memory buffering to a temporary
      file. Default 1024.

   .. method:: read(n: int = -1)
      :async:

      Read up to *n* bytes from the upload stream. ``-1`` reads to end.

   .. method:: save(path_or_file)
      :async:

      Save the upload to *path_or_file*, which can be a filesystem
      path or an already-open file object.

   .. method:: copy(max_memory_size: int | None = None)
      :async:

      Buffer the upload (either in RAM or in a temp file, depending on
      ``max_memory_size``) so the rest of the multipart body can be
      parsed without the original stream being invalidated. The
      :func:`with_form_data` decorator calls this automatically.

   .. method:: close()
      :async:

      Release any temporary file created by :meth:`copy`. Called
      automatically when the request finishes if the upload reached
      :attr:`request.files` via :func:`with_form_data`.

Module-level decorators
-----------------------

.. function:: with_form_data(f)

   Decorator that parses the multipart body up front and populates
   :attr:`request.form <microdot.Request.form>` and
   :attr:`request.files <microdot.Request.files>` before the handler
   runs::

       from microdot import Microdot
       from microdot.multipart import with_form_data

       app = Microdot()

       @app.post('/upload')
       @with_form_data
       async def upload(request):
           print('fields:', dict(request.form))
           for name, file in request.files.items():
               await file.save('/sdcard/' + sanitize(file.filename))
           return 'ok'

   File uploads are buffered via :meth:`FileUpload.copy`, so the
   handler can iterate ``request.files`` and ``request.form`` freely.
   Temporary files are cleaned up automatically when the request
   ends.

For uploads larger than a couple of megabytes, prefer the streaming
:class:`FormDataIter` API; :func:`with_form_data` accumulates the
entire request in memory or on the filesystem before the handler
runs.
