#!/usr/bin/env python3
"""Force One - one-command launcher (Python).

The site itself runs on Node (React + Vite frontend, Express + SQLite backend).
This file just checks that Node is installed and then hands over to start.js,
which creates backend/.env, installs dependencies and starts everything.

Usage:
    python main.py              start in development mode and open the browser
    python main.py --no-open    start without opening the browser
    python main.py --prod       build the frontend and serve it from the backend
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
        version = subprocess.check_output([node, "--version"], text=True).strip()
        major = int(version.lstrip("v").split(".")[0])
    except (subprocess.CalledProcessError, ValueError):
        major = 0
    if major < 20:
        print(f"Node.js 20 or newer is required (found {version if major else 'unknown'}).")
        return 1

    try:
        return subprocess.call([node, os.path.join(ROOT, "start.js"), *sys.argv[1:]], cwd=ROOT)
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    sys.exit(main())
