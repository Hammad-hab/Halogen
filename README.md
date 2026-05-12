# Halogen

A shader-powered macOS app launcher where applications are rendered as a GPU scene instead of a static grid UI.

---

## Overview

Halogen is a customizable macOS launcher built around a real-time rendering engine. Instead of a traditional icon grid, apps are displayed as shader-driven objects inside a GPU-rendered interface.

Each application icon can have its own visual material, and the entire launcher can be styled using custom GLSL shaders and postprocessing effects.

---

## Features

- GPU-rendered app grid (Three.js)
- Shader-based icon system (per-app overrides)
- Custom global icon shader fallback
- Configurable layout system
- Adjustable icon size, text, and positioning
- Window fade-in / fade-out transitions (Tauri events)
- External app indexing pipeline (Python)
- Icon extraction and conversion system
- TOML-based app manifest generation
- Demand-based rendering mode (performance optimized)

---

## Architecture

Halogen is split into three layers:

### 1. Python (App Indexer)
- Scans macOS Applications folders
- Extracts app metadata
- Converts `.icns` icons to PNG
- Generates app manifest (`applist.toml`)

### 2. Tauri (System Bridge)
- Handles windowing
- Executes native commands
- Opens applications
- Acts as IPC layer between frontend and OS

### 3. React + Three.js (Render Engine)
- Renders app grid as a GPU scene
- Applies shader materials per icon
- Handles interaction and animation
- Controls visual state of the launcher

---

## Rendering Model

Each app is rendered as:

- A plane mesh
- A texture (app icon)
- A fragment shader (custom or global fallback)

Shader uniforms can include:
- icon texture
- mouse interaction state
- position data

---
