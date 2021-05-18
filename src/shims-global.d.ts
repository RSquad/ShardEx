import { Browser } from "webextension-polyfill-ts";

declare global {
  interface Window {
    shard_ex_ton: {
      request: (method: any, params: any) => any;
    };
  }
  declare const browser: Browser;
}
