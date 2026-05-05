import { create } from 'zustand'

interface AppInfo {
  name: string;
  path: string;
  icon: string
};

interface AppInfoStore {
  appInfos: AppInfo[],
  setInformation: (infos: AppInfo[]) => void
}


const useAppStore = create<AppInfoStore>((set) => ({
  appInfos: [],
  setInformation: (infos: AppInfo[]) => set({appInfos: infos}),
}))


export {
  useAppStore,
}

export type {AppInfo}