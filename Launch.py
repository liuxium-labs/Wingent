import subprocess, os, webbrowser

base = os.path.dirname(os.path.abspath(__file__))
os.chdir(base)
subprocess.run("taskkill /F /IM electron.exe /T", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
subprocess.run("taskkill /F /IM wingent.exe /T", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

webbrowser.open("http://localhost:8080")

exe = os.path.join(base, "node_modules", ".bin", "electron.cmd")

if os.path.exists(exe):
    subprocess.Popen([exe, "."], creationflags=0x08000000)
else:
    subprocess.Popen("npx electron .", shell=True, creationflags=0x08000000)