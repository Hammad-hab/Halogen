from icns import listApps
import toml, os

apps = listApps()
appdict = {
  "iconShader":  """
          uniform sampler2D icon;
          varying vec2 vUv;
          void main() {
            gl_FragColor = texture2D(icon, vUv)*2.0;
          }
  """
}
for app in apps:
    appdict[app.name] = {
        'path': app.path,
        'icn': app.iconPath,
        'shader': None,
        'tags': [],
        'inFolder': []
    }

s = (toml.dumps(appdict))

with open(os.path.expanduser('~/.icons/applist.toml'), "w") as f:
    f.write(s)