import os
from PIL import Image
from AppKit import NSWorkspace, NSMakeSize
import io

OUTDIR = "~/.icons/"

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
    icon.setSize_(NSMakeSize(512, 512))
    
    tiff = icon.TIFFRepresentation()
    return bytes(tiff) if tiff else None

def convertIcns(name: str, icns_data: bytes):
    if not icns_data:
        raise ValueError('Cannot convert icon since it is null')

    path = os.path.expanduser(OUTDIR)
    os.makedirs(path, exist_ok=True)
    safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()
    base = os.path.join(path, f"{safe_name}.png")
    
    if not os.path.exists(base):
        img = Image.open(io.BytesIO(icns_data))
        img.save(base)
    return base

def listApps():
    # Define all app locations
    app_locations = [
        '/Applications',
        '/System/Applications',
        os.path.expanduser('~/Applications')
    ]
    
    apps = []
    seen_names = set()  # Avoid duplicates across directories
    
    for location in app_locations:
        if not os.path.exists(location):
            continue
        
        try:
            app_files = os.listdir(location)
        except PermissionError:
            print(f"Permission denied: {location}")
            continue
        
        for app in app_files:
            if ignore(app):
                continue
            
            app_name = fmtName(app)
            
            # Skip if we've already processed this app name
            if app_name in seen_names:
                continue
            
            try:
                app_path = f"{location}/{app}"
                icns_data = findIcns(app_path)
                
                if icns_data:  # Only convert if icon exists
                    icon_path = convertIcns(app_name, icns_data)
                    apps.append({
                        'name': app_name,
                        'path': app_path,
                        'icon_path': icon_path
                    })
                    seen_names.add(app_name)
            except Exception as e:
                print(f"Failed to process {app}: {e}")
                continue
    
    return apps

if __name__ == "__main__":
    apps = listApps()
    for app in apps:
        print(app['name'])