import browserErrors from "@/api/browser";
import { Windows } from "webextension-polyfill-ts";
import { store } from "../store/index";

const _ = {
  createPopup: async function(position: any) {
    return new Promise((resolve) => {
      browser.windows
        .create({
          url: "index.html",
          type: "popup",
          width: 357,
          height: 600,
          left: position.x,
          top: position.y,
        })
        .then((popup) => {
          resolve(popup);
        });
    });
  },
  getLastFocusedWindow: function(): Promise<Windows.Window> {
    return new Promise((resolve) => {
      browser.windows.getLastFocused().then((windowObject) => {
        browserErrors.throwErrorIfOccurred();
        return resolve(windowObject);
      });
    });
  },
  getAllWindows: function() {
    return new Promise((resolve) => {
      browser.windows.getAll().then((windows) => {
        browserErrors.throwErrorIfOccurred();
        return resolve(windows);
      });
    });
  },
  getCurrentWindow: function(): Promise<Windows.Window> {
    return new Promise((resolve) => {
      browser.windows.getCurrent().then((windows) => {
        browserErrors.throwErrorIfOccurred();
        return resolve(windows);
      });
    });
  },
  findPopup: async function() {
    const popup = store.getters["popupId"];
    if (null === popup) {
      return null;
    }
    const windows: any = await this.getAllWindows();
    for (const i in windows) {
      if (windows[i].id === popup.id) {
        console.log(windows[i])
        return windows[i];
      }
    }
    return null;
  },
  focusWindow: async function(id: number) {
    return new Promise((resolve) => {
      browser.windows.update(id, { focused: true }).then(() => {
        browserErrors.throwErrorIfOccurred();
        return resolve(true);
      });
    });
  },
};

export default {
  callPopup: async function(doCreateIfNotExists = true) {
    let popup = await _.findPopup();
    console.log(popup);
    if (null !== popup) {
      const currentWindow = await _.getCurrentWindow();
      if (currentWindow.id === popup.id) {
        return false;
      }
      await _.focusWindow(popup.id);
      return true;
    } else if (doCreateIfNotExists) {
      const position = { x: 0, y: 0 };
      try {
        const lastFocused = await _.getLastFocusedWindow();
        const { left, width, top } = lastFocused;
        if (left && width && top) {
          position.x = left + (width - 300 - 20);
          position.y = top + 20;
        }
      } catch (err) {
        position.x = Math.max(window.screenX + (window.outerWidth - 300), 0);
        position.y = Math.max(window.screenY, 0);
      }
      popup = await _.createPopup(position);
      store.commit("setPopupId", { id: popup.id });
      return true;
    }
    return false;
  },
  getCurrentWindow: async function() {
    return await _.getCurrentWindow();
  },
};
