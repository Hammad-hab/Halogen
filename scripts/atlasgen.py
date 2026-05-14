import os
from PIL import Image
from AppKit import NSWorkspace, NSMakeSize
import io
import json
import math

OUTDIR = "~/.icons/"
ICON_SIZE = 128  # normalize icons for consistent packing

def ignore(name: str):
    return name.startswith(".") or not name.endswith(".app")

def fmtName(name: str):
    return name.replace('.app', "")

def findIcns(app_path: str):
    workspace = NSWorkspace.sharedWorkspace()
    icon = workspace.iconForFile_(app_path)

    if icon is None:
        return None

    icon.setSize_(NSMakeSize(512, 512))
    tiff = icon.TIFFRepresentation()
    return bytes(tiff) if tiff else None

def load_icon_image(icns_data: bytes):
    return Image.open(io.BytesIO(icns_data)).convert("RGBA")

def listApps():
    app_locations = [
        '/Applications',
        '/System/Applications',
        os.path.expanduser('~/Applications')
    ]

    apps = []

    for location in app_locations:
        if not os.path.exists(location):
            continue

        try:
            app_files = os.listdir(location)
        except PermissionError:
            continue

        for app in app_files:
            if ignore(app):
                continue

            try:
                app_path = f"{location}/{app}"
                icns_data = findIcns(app_path)

                if icns_data:
                    img = load_icon_image(icns_data)

                    apps.append({
                        "name": fmtName(app),
                        "path": app_path,
                        "image": img
                    })

            except Exception:
                continue

    # Sort by path for deterministic atlas builds
    apps.sort(key=lambda x: x["path"])
    
    return apps


def build_atlas(apps):
    path = os.path.expanduser(OUTDIR)
    os.makedirs(path, exist_ok=True)

    num_icons = len(apps)
    
    # Calculate optimal grid dimensions
    cols = math.ceil(math.sqrt(num_icons))
    rows = math.ceil(num_icons / cols)
    
    # Create atlas with exact size needed
    atlas_width = cols * ICON_SIZE
    atlas_height = rows * ICON_SIZE
    atlas = Image.new("RGBA", (atlas_width, atlas_height))

    uv_map = {}

    for i, app in enumerate(apps):
        img = app["image"].resize((ICON_SIZE, ICON_SIZE), Image.Resampling.LANCZOS)

        col = i % cols
        row = i // cols

        x = col * ICON_SIZE
        y = row * ICON_SIZE

        atlas.paste(img, (x, y))

        # ✅ FIX: Flip Y for OpenGL (bottom-left origin)
        uv_x = x / atlas_width
        uv_y = 1.0 - ((row + 1) * ICON_SIZE) / atlas_height  # Flip Y
        uv_w = ICON_SIZE / atlas_width
        uv_h = ICON_SIZE / atlas_height

        uv_map[app["path"]] = {
            "name": app["name"],
            "x": uv_x,
            "y": uv_y,
            "w": uv_w,
            "h": uv_h,
        }

    atlas_path = os.path.join(path, "atlas.png")
    json_path = os.path.join(path, "atlas.json")

    atlas.save(atlas_path)

    with open(json_path, "w") as f:
        json.dump(uv_map, f, indent=2)

    print(f"Generated atlas with {len(apps)} icons ({cols}x{rows} grid, {atlas_width}x{atlas_height}px)")
    
    return atlas_path, json_path
    
if __name__ == "__main__":
    apps = listApps()
    print(f"Found {len(apps)} apps")
    atlas_path, json_path = build_atlas(apps)

    print("Atlas:", atlas_path)
    print("UV Map:", json_path)