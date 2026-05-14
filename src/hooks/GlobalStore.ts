import { create } from 'zustand'



interface GlobalState {
  [name: string]: any
};

interface AppInfoStore {
    global: GlobalState,
  setGlobalProperty: (name: string, value: any) => void
}


const useGlobalStorage = create<AppInfoStore>((set) => ({
  global: {},
  setGlobalProperty: (name, value) => set((state) => ({global: { ...state.global, [name]: value }})),
}))

export {
  useGlobalStorage,
}