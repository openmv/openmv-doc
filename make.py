#!/usr/bin/env python

# by: Kwabena W. Agyeman - kwagyeman@openmv.io

import os, sys

def make():

    __folder__ = os.path.dirname(os.path.abspath(__file__))

    if sys.platform.startswith('win'):
        os.environ["MICROPY_PORT"] = "openmvcam"
        if os.system("cd " + os.path.join(__folder__,
        "micropython/docs") + " && make.bat html"):
            sys.exit("Make Failed...")

    else:
        if os.system("cd " + os.path.join(__folder__,
        "micropython/docs") + " && make MICROPY_PORT=openmvcam "
        "BUILDDIR=_build html"):
            sys.exit("Make Failed...")

if __name__ == "__main__":
    make()
