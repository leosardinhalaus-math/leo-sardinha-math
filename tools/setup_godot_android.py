"""Configure only the isolated CI editor settings, using explicit SDK paths."""
import json
import os
from pathlib import Path

root=Path(os.environ.get('XDG_CONFIG_HOME',str(Path.home()/'.config')))/'godot'
root.mkdir(parents=True,exist_ok=True)
sdk=os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
java=os.environ.get('JAVA_HOME')
if not sdk or not java:
    raise SystemExit('ANDROID_HOME and JAVA_HOME must point to installed SDKs.')
content='[gd_resource type="EditorSettings" format=3]\n\n[resource]\n'
content+='export/android/android_sdk_path = '+json.dumps(sdk)+'\n'
content+='export/android/java_sdk_path = '+json.dumps(java)+'\n'
(root/'editor_settings-4.7.tres').write_text(content)
print('Android SDK and Java paths configured for Godot 4.7.')
