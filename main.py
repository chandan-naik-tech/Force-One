#!/usr/bin/env python3
"""Force One - one-command launcher (Python entry point).

The site itself is React/Vite + Node/Express + SQLite. This file just checks
that Node.js is installed and then runs `start.js`, which creates backend/.env,
installs dependencies, starts the backend and frontend and opens the browser.

Usage:
    python main.py              # development mode
    python main.py --no-open    # don't open the browser
    python main.py --prod       # build the frontend and serve it from the backend
"""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


def main() -> int:
    node = shutil.which("node")
    if not node:
        print("Node.js 20 or newer is required but was not found.")
        print("Install it from https://nodejs.org and run this file again.")
        return 1

    try:
        return subprocess.call([node, "start.js", *sys.argv[1:]], cwd=ROOT)
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    sys.exit(main())
