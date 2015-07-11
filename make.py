#!/usr/bin/env python

# by: Kwabena W. Agyeman - kwagyeman@openmv.io

import argparse, os, sys, subprocess, ftplib

def make():

    __folder__ = os.path.dirname(os.path.abspath(__file__))

    parser = argparse.ArgumentParser(description =
    "Make Script")

    parser.add_argument("-u", "--upload", nargs = '?',
    help = "FTP Password")

    args = parser.parse_args()

    ###########################################################################

    if sys.platform.startswith('win'):
        if os.system("cd " + os.path.join(__folder__,
        "micropython/docs") + " && make.bat html"):
            sys.exit("Make Failed...")

    else:
        if os.system("cd " + os.path.join(__folder__,
        "micropython/docs") + " && make html"):
            sys.exit("Make Failed...")

    ###########################################################################

    if args.upload:
        subprocess.check_call(["python", "ftpsync.py", "-u", "-l",
        "ftp://docs@openmv.io:" + args.upload + "@ftp.openmv.io",
        os.path.join(__folder__, "micropython/docs/_build/html")])

if __name__ == "__main__":
    make()
