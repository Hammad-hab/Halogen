use tauri::{AppHandle, Manager,};
use tauri_plugin_global_shortcut::{GlobalShortcutExt};
use tauri::Emitter;

mod launcher_cmds;
use launcher_cmds::{read_file, open_app};


fn toggle_window(app: &AppHandle)  {
    if let Some(window) = app.get_webview_window("main") {
        // Window exists, toggle visibility
        if window.is_visible().unwrap_or(false) {
            // let _ = window.hide();
            let _ = window.emit("fade-out", ());
            #[cfg(target_os = "macos")]
            unsafe {
                use cocoa::appkit::{NSApplication, NSApplicationPresentationOptions};
                let app = cocoa::appkit::NSApp();
                app.setPresentationOptions_(NSApplicationPresentationOptions::NSApplicationPresentationDefault);
            }
        } else {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = window.emit("fade-in", ());
            #[cfg(target_os = "macos")]
            unsafe {
                use cocoa::appkit::{NSApplication, NSApplicationPresentationOptions};
                let app = cocoa::appkit::NSApp();
                let options = NSApplicationPresentationOptions::NSApplicationPresentationHideDock
                    | NSApplicationPresentationOptions::NSApplicationPresentationHideMenuBar;
                app.setPresentationOptions_(options);
            }
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
        .transparent(true)
        .resizable(false)
        .skip_taskbar(true)
        .center()
        .build()
        .unwrap();

        #[cfg(target_os = "macos")]
        {
            use cocoa::appkit::{NSWindow, NSWindowCollectionBehavior, NSApplication, NSApplicationPresentationOptions, NSScreen};
            use cocoa::base::{id, YES};
            use cocoa::foundation::{NSRect, NSPoint, NSSize};

            let ns_window = window.ns_window().unwrap() as id;
            unsafe {
                // First hide the Dock and menu bar
                let app = cocoa::appkit::NSApp();
                let options = NSApplicationPresentationOptions::NSApplicationPresentationHideDock
                    | NSApplicationPresentationOptions::NSApplicationPresentationHideMenuBar;
                app.setPresentationOptions_(options);
                
                // Get the main screen
                let screen = NSScreen::mainScreen(cocoa::base::nil);
                let screen_frame = NSScreen::frame(screen);
                
                // Extend frame to cover safe areas - add extra pixels
                let full_frame = NSRect {
                    origin: NSPoint { x: 0.0, y: -30.0 },  // Start below the screen
                    size: NSSize { 
                        width: screen_frame.size.width, 
                        height: screen_frame.size.height + 60.0  // Add extra height top and bottom
                    },
                };
                
                // Set window frame
                ns_window.setFrame_display_(full_frame, YES);
                
                // Set window level high
                ns_window.setLevel_(25);
                
                // Set collection behavior
                let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                    | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
                    | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary;
                ns_window.setCollectionBehavior_(behavior);
                
                // Background color
                use cocoa::appkit::NSColor;
                use cocoa::base::nil;
                
                let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                    nil,
                    0.0,
                    0.0,
                    0.0,
                    0.001,
                );
                ns_window.setBackgroundColor_(bg_color);
            }
        }
        
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
        .invoke_handler(tauri::generate_handler![read_file, open_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}