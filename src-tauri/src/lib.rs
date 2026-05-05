use std::fs;
use serde::Serialize;
use tauri::{AppHandle, Manager,};
use tauri_plugin_global_shortcut::{GlobalShortcutExt};
#[cfg(target_os = "macos")]
use cocoa::appkit::NSWindow;
#[cfg(target_os = "macos")]
use cocoa::base::id;

#[derive(Serialize)]
struct AppInfo {
    name: String,
    path: String,
    icon: String,
}

#[tauri::command]
fn list_apps() -> Vec<AppInfo> {
    let mut apps = Vec::new();

    let home = std::env::var("HOME").unwrap();
    let icons_dir = format!("{}/.icons", home);
    
    // Common macOS application directories
    let path_formatted = format!("{}/Applications", home);
    let app_dirs = vec![
        "/Applications",
        &path_formatted,
        "/System/Applications",
    ];

    if let Ok(entries) = fs::read_dir(&icons_dir) {
        for entry in entries.flatten() {
            let path = entry.path();

            if path.extension().and_then(|e| e.to_str()) == Some("png") {
                let name = path
                    .file_stem()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .to_string();

                // Search for the app in common directories
                let app_path = find_app_path(&name, &app_dirs);

                apps.push(AppInfo {
                    name: name.clone(),
                    path: app_path,
                    icon: path.to_string_lossy().to_string(),
                });
            }
        }
    }

    apps
}

fn find_app_path(app_name: &str, search_dirs: &[&str]) -> String {
    // Try exact match first (e.g., "Safari.app")
    let app_filename = if app_name.ends_with(".app") {
        app_name.to_string()
    } else {
        format!("{}.app", app_name)
    };

    for dir in search_dirs {
        let full_path = format!("{}/{}", dir, app_filename);
        if fs::metadata(&full_path).is_ok() {
            return full_path;
        }
    }

    // If not found, try case-insensitive search
    for dir in search_dirs {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let entry_name = entry.file_name();
                let entry_str = entry_name.to_string_lossy();
                
                if entry_str.to_lowercase() == app_filename.to_lowercase() {
                    return entry.path().to_string_lossy().to_string();
                }
            }
        }
    }

    // Return empty string if not found
    String::new()
}

#[tauri::command]
fn open_app(path: String) {
    let _ = std::process::Command::new("open")
        .arg(path)
        .spawn();
}

fn toggle_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        // Window exists, toggle visibility
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    } else {
        // Create window if it doesn't exist

        let window = tauri::WebviewWindowBuilder::new(
            app,
            "main",
            tauri::WebviewUrl::default()
        )
        .title("launcher")
        .always_on_top(true)
        .inner_size(1470.0, 950.0)
        .decorations(false)
        .resizable(false)
        .skip_taskbar(true)
        .center()
        .build()
        .unwrap();

        // let monitor = window.current_monitor().unwrap().unwrap();
        // let scale = monitor.scale_factor();

        // let size = monitor.size();
        // let logical_height = size.height as f64 / scale;
        // let logical_width = size.width as f64 / scale;

        // let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        //     width: logical_width,
        //     height: logical_height,
        // }));
        // let _ = window.center(); // <-- THIS fixes your issue

        // #[cfg(target_os = "macos")]
        // unsafe {
        //     extern "C" {
        //         fn CGShieldingWindowLevel() -> i32;
        //     }

        //     let ns_window = window.ns_window().unwrap() as id;
        //     ns_window.setLevel_(CGShieldingWindowLevel().into());
        // }

        let _ = window.show();
        let _ = window.set_focus();


    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Register global shortcut (e.g., Cmd+Space on macOS, Ctrl+Space on others)
            #[cfg(target_os = "macos")]
            let shortcut = "Option+Space";
        
                use tauri::ActivationPolicy;
                app.set_activation_policy(ActivationPolicy::Accessory);
 

            let app_handle = app.handle().clone();
            app.handle()
                .plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, _shortcut, event| {
                            if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                                toggle_window(&app_handle);
                            }
                        })
                        .build(),
                )?;

            app.global_shortcut().register(shortcut)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![list_apps, open_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

