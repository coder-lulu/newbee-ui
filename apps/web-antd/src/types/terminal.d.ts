declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

export interface Machine {
  id: number;
  machineName: string;
  host: string;
  port: number;
  username: string;
  status?: string;
}

export interface SSHConfig {
  target: string;
  port: number;
  username: string;
  password?: string;
  private_key?: string;
  auth_type: string;
  cols: number;
  rows: number;
  session_id: string;
}

export interface TerminalOptions {
  accessToken: string;
  backgroundColor: string;
  fontColor: string;
  fontSize: number;
  fontFamily: string;
  enableWebLink: number;
}
