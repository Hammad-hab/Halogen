import { invoke } from "@tauri-apps/api/core";
import { homeDir, join } from "@tauri-apps/api/path";
import { useEffect } from "react";
import { AppInfo, useAppStore } from "./AppStore";
import * as TOML from "js-toml";
import { Files } from "../Files";

const useApplications = () => {
    const apps = useAppStore()
    useEffect(() => {
      (async () => {
        const home = await homeDir();
        const appListPath = await join(home, Files.ICONSDIR, Files.APPLIST);
        invoke<string>("read_file", { path: appListPath }).then((data) => {
          const t = TOML.load(data);
          apps.setInformation(t as AppInfo);
        });
      })();
    }, []); 
    return apps
  }

export {
    useApplications
}