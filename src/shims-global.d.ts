import { Browser } from "@types/webextension-polyfill";

declare global {
  declare const browser: Browser;
}
