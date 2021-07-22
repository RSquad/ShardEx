import { Browser } from "webextension-polyfill-ts";

declare global {
  declare const browser: Browser;
}
