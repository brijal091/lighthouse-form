import os
import platform
import shutil
light = shutil.which("lighthouse")
print(shutil.which("lighthouse"))
print(os.name)
print(platform.system())
print(os.path.exists(light))