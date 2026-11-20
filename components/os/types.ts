import type { ReactNode } from "react";
import type { IconKey } from "./icons";

export type AppId = string;

export type OsApi = {
  launch: (id: AppId) => boolean;
  toast: (title: string, body: string, from?: AppId) => void;
};

export type AppDef = {
  id: AppId;
  title: string;
  icon: IconKey;
  tone: string;
  size: { w: number; h: number };
  pos: { x: number; y: number };
  render: (api: OsApi) => ReactNode;
};

export type WindowState = {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
};
