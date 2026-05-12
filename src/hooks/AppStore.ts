import { create } from 'zustand'

interface AppItem {
  path: string,
  icn: string,
  shader?: string,
}

interface AppInfo {
  [name: string]: AppItem
};

interface AppInfoStore {
  appInfos: AppInfo,
  setInformation: (infos: AppInfo) => void
  iconShader: string,
  setIconShader: (shader: string) => void
}


const useAppStore = create<AppInfoStore>((set) => ({
  appInfos: {},
  iconShader: "",
  setInformation: (infos: AppInfo) => set({appInfos: infos}),
  setIconShader: (shader: string) => set({iconShader: shader}),
}))


export {
  useAppStore,
}

export type {AppInfo, AppItem}