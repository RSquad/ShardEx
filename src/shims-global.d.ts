import { Browser } from "webextension-polyfill-ts";

declare global {
  interface Window {
    ton: {
      request: (method: any, params: any) => any;
    };
  }
  declare const browser: Browser;
}
