import subprocess
import os

result = subprocess.run(
    ["osascript", "-e", 'tell app "Finder" to get POSIX path of (get desktop picture as alias)'],
    capture_output=True, text=True
)
path = (result.stdout.strip())
subprocess.run([
    'cp', path, f"{os.path.expanduser('~/.icons/')}/wallpaper.png"
])