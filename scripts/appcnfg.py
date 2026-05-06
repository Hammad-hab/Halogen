from icns import listApps
import toml, os

apps = listApps()
appdict = {}
for app in apps:
    appdict[app.name] = {
        'path': app.path,
        'icn': app.iconPath
    }

s = (toml.dumps(appdict))
with open(os.path.expanduser('~/.icons/applist.toml'), "w") as f:
    f.write(s)