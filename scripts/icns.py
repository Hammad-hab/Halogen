import os
from PIL import Image
from AppKit import NSWorkspace
import io

class Application:
    OUTDIR = "~/.icons/"
    
    def __init__(self) -> None:
        self.name = None
        self.path = None
        self.icns = None
        self.iconPath = None
    
    def convIcns(self):
        if not self.icns:
            raise ValueError('Cannot convert icon since it is null')

        path = os.path.expanduser(Application.OUTDIR)
        os.makedirs(path, exist_ok=True)
        safe_name = "".join(c for c in self.name if c.isalnum() or c in (' ', '-', '_')).strip()
        base = os.path.join(path, f"{safe_name}.png")
        
        if not os.path.exists(base):
            img = Image.open(io.BytesIO(self.icns))
            img.save(base)
        self.iconPath = base

def ignore(name: str):
    return name.startswith(".") or not name.endswith(".app")

def fmtName(name: str):
    return name.replace('.app', "")

def findIcns(app_path: str):
    workspace = NSWorkspace.sharedWorkspace()
    icon = workspace.iconForFile_(app_path)
    
    if icon is None:
        return None
    
    # Force macOS to render at a specific size (512x512)
    from AppKit import NSMakeSize
    icon.setSize_(NSMakeSize(512, 512))
    
    tiff = icon.TIFFRepresentation()
    return bytes(tiff) if tiff else None

def listApps():
    # Define all app locations
    app_locations = [
        '/Applications',
        '/System/Applications',
        os.path.expanduser('~/Applications')
    ]
    
    appsStrct = []
    seen_names = set()  # Avoid duplicates across directories
    
    for location in app_locations:
        if not os.path.exists(location):
            continue
        
        try:
            apps = os.listdir(location)
        except PermissionError:
            print(f"Permission denied: {location}")
            continue
        
        for app in apps:
            if ignore(app):
                continue
            
            app_name = fmtName(app)

            
            # Skip if we've already processed this app name
            if app_name in seen_names:
                continue
            
            try:
                strct = Application()
                strct.name = app_name
                strct.path = f"{location}/{app}"
                strct.icns = findIcns(strct.path)
                
                if strct.icns:  # Only convert if icon exists
                    strct.convIcns()
                    appsStrct.append(strct)
                    seen_names.add(app_name)
            except Exception as e:
                print(f"Failed to process {app}: {e}")
                continue
    
    return appsStrct

if __name__ == "__main__":
    apps = listApps()
    for app in apps:
        print(app.name)