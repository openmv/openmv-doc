.. currentmodule:: ml.apps

:mod:`ml.apps` --- ML Apps
==========================

.. module:: ml.apps
    :synopsis: ML Apps

The `ml.apps` module contains high-level ML application classes built on top of `ml.Model`.

.. _apps.MicroSpeech:

class MicroSpeech -- Speech Recognition
---------------------------------------

The MicroSpeech object recognizes simple spoken words using the MicroSpeech model from
TensorFlow Lite for Microcontrollers. The default model recognizes ``"Yes"`` and ``"No"``.

.. class:: MicroSpeech(preprocessor: ml.Model = None, micro_speech: ml.Model = None, labels: list[str] = None, **kwargs)

    Creates a MicroSpeech object.

    ``preprocessor`` is the audio preprocessor `ml.Model`. If ``None``, ``/rom/audio_preprocessor.tflite``
    is loaded.

    ``micro_speech`` is the speech recognition `ml.Model`. If ``None``, ``/rom/micro_speech.tflite``
    is loaded.

    ``labels`` is a list of label strings matching the model output categories. If ``None``, the labels
    are taken from ``micro_speech.labels``.

    Any additional keyword arguments are forwarded to `audio.init()` (the audio peripheral is
    initialized with ``channels=1``, ``frequency=16000``, and ``samples=320``).

    .. method:: audio_callback(buf: bytes) -> None

        Internal audio streaming callback. Appends new samples from ``buf`` into the rolling audio
        buffer, updates the spectrogram by running the ``preprocessor`` model on the latest window,
        and updates the prediction history by running the ``micro_speech`` model on the spectrogram.
        Not normally called directly.

    .. method:: start_audio_streaming() -> None

        Clears the spectrogram and prediction history, then starts audio streaming with
        `MicroSpeech.audio_callback` as the callback. No-op if streaming is already started.

    .. method:: stop_audio_streaming() -> None

        Stops audio streaming.

    .. method:: listen(timeout: int = 0, callback: callable = None, threshold: float = 0.65, filter: list[str] = [Yes, No]) -> tuple[str, numpy.ndarray]

        Listens for a spoken word and returns a tuple of ``(label, average_scores)`` once a label whose
        averaged score is above ``threshold`` and is contained in ``filter`` is detected. Calls
        `MicroSpeech.start_audio_streaming` if not already streaming.

        ``timeout`` is the maximum time in milliseconds to listen. If ``0``, listens indefinitely until
        a word is recognized. If ``-1``, runs in non-blocking mode and returns immediately with
        ``(None, average_scores)`` if no word is recognized; audio streaming is left running. For any
        positive value, listens for that many milliseconds and then returns ``(None, average_scores)``
        on timeout.

        ``callback`` is an optional callable invoked as ``callback(label, average_scores)`` when a word
        is recognized instead of returning. Combined with ``timeout=0``, this allows continuous
        recognition.

        ``threshold`` is the minimum averaged confidence required to accept a recognition.

        ``filter`` is the list of label strings to accept. Recognitions outside this list are ignored.

    .. attribute:: MicroSpeech._SLICE_SIZE
        :type: int

        Number of features per spectrogram slice (``40``).

    .. attribute:: MicroSpeech._SLICE_COUNT
        :type: int

        Number of spectrogram slices stored (``49``).

    .. attribute:: MicroSpeech._SLICE_TIME_MS
        :type: int

        Time span of one slice in milliseconds (``30``).

    .. attribute:: MicroSpeech._AUDIO_FREQUENCY
        :type: int

        Audio sample rate in Hz (``16000``).

    .. attribute:: MicroSpeech._SAMPLES_PER_STEP
        :type: int

        Audio samples per 10 ms step (``160``).

    .. attribute:: MicroSpeech._CATEGORY_COUNT
        :type: int

        Number of output categories (``4``).

    .. attribute:: MicroSpeech._AVERAGE_WINDOW_SAMPLES
        :type: int

        Number of prediction frames averaged over the smoothing window (``1020 // _SLICE_TIME_MS``).
