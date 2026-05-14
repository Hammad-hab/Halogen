import { create } from 'zustand'
import { deepMerge } from '../utils'
import { CSSProperties } from 'react'
import { Cursor } from './useTauriEvent'

interface AppSettings {
    searchBar: {
        placeholder: string,
        overrideStyle: CSSProperties
    },
    appBg: string | null,
    appOverrideStyle: CSSProperties,
    renderLoopMode: "demand" | "always",
    appItem: {
      size: number,
      onHoverCursor: Cursor,
      textScale: number,
      textColor: string,
      textRelativePosition: [number, number, number],
      textRelativeRotation: [number, number, number],
      disableText: boolean,
    },
    appGrid: {
      spacingX: number,
      spacingY: number,
      scrollDamping: number,
      xOffset: number,
      yOffset: number,
    }
};
  
interface AppSettingsStore {
  settings: AppSettings,
  setSettings: (settings: AppSettings) => void
}


const useAppSettings = create<AppSettingsStore>((set) => ({
  settings: {
    searchBar: {
        placeholder: "Search",
        overrideStyle: {}
    },
    appBg: null,
    appOverrideStyle: {},
    renderLoopMode: "demand",
    appItem: {
      size: 0.8,
      onHoverCursor: Cursor.POINTER,
      textScale: 0.1,
      textColor: "white",
      textRelativePosition: [0.0, -0.5, 0],
      textRelativeRotation: [0, 0, 0],
      disableText: true,
    },
    appGrid: {
      spacingX: 1.0,
      spacingY: 1.2,
      scrollDamping: 0.15,
      xOffset: 0,
      yOffset: -4,
    }
  },
  setSettings: (partial: Partial<AppSettings>) =>
    set((state) => ({
      settings: deepMerge(state.settings, partial),
    })),
}))


export {
    useAppSettings,
}

export type {AppSettings}