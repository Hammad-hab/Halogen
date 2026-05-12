import { invoke } from "@tauri-apps/api/core";
import { homeDir, join } from "@tauri-apps/api/path";
import { useEffect } from "react";
import { AppInfo, useAppStore } from "./AppStore";
import * as TOML from "js-toml";
import { Files } from "../Files";
import { useAppSettings } from "./useAppSettings";

const useApplications = () => {
    const apps = useAppStore()
    const settings = useAppSettings()
    useEffect(() => {
      (async () => {
        const home = await homeDir();
        const appListPath = await join(home, Files.ICONSDIR, Files.APPLIST);
        invoke<string>("read_file", { path: appListPath }).then((data) => {
          const t = TOML.load(data);
          const {iconShader, appSettings, ...rest} = t as {iconShader: string | any, appSettings: any, [key: string]: {path: string, icn: string, shader: string}};
          apps.setInformation(rest as AppInfo);
          settings.setSettings(appSettings);
          apps.setIconShader(iconShader);
        });
      })();
    }, []); 
    return apps
  }

export {
    useApplications
}