import subprocess
import os
import platform
import shutil

def run_lighthouse(url="https://www.google.com", output_file="report.html", headless=True):
    is_windows = platform.system() == "Windows"

    if is_windows:
        lighthouse_cmd = os.path.expandvars(r"%APPDATA%\npm\lighthouse.cmd")
    else:
        lighthouse_cmd = shutil.which("lighthouse")

    print(lighthouse_cmd)
    if not lighthouse_cmd or not os.path.exists(lighthouse_cmd):
        raise FileNotFoundError("1.Lighthouse not found. Install it with: npm install -g lighthouse")

    cmd = [
        lighthouse_cmd,
        url,
        '--output', 'html',
        '--output-path', output_file
    ]

    if headless:
        cmd.append('--chrome-flags=--headless')

    result = subprocess.run(cmd, capture_output=True, text=True)

    return result.stdout, result.stderr
