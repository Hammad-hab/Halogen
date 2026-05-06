
#[tauri::command]
pub fn open_app(path: String) {
    let _ = std::process::Command::new("open")
        .arg(path)
        .spawn();
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}