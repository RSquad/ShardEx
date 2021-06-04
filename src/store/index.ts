import Vue from "vue";
import Vuex from "vuex";
import { createStore } from "vuex-smart-module";
import { root } from "./root";
// @ts-ignore
import createMutationsSharer, { BroadcastChannelStrategy } from "vuex-shared-mutations";
import VuexPersistence from "vuex-persist";

Vue.use(Vuex);

export const browserVuexLocalStorage = {
  setItem: (key: string | number, value: any): Promise<any> => {
    const newItemCache: any = {};
    newItemCache[key] = value;
    return browser.storage.local.set(newItemCache);
  },
  getItem: (key: any): Promise<any> => {
    return browser.storage.local.get(key).then((data: any) => data[key]);
  },
  removeItem: (key: string | string[]): Promise<any> => {
    return browser.storage.local.remove(key);
  },
  clear: (): Promise<any> => {
    return browser.storage.local.clear();
  },
  length: (): Promise<any> => browser.storage.local.get("vuex").then((data: any) => data["vuex"].length),
  key: (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve("vuex");
      }, 100);
    }),
};

export const vuexLocal = new VuexPersistence({
  storage: browserVuexLocalStorage,
  asyncStorage: true,
  key: "vuex",
  modules: ["accounts", "wallet", "keystore"],
});

export const store = createStore(root, {
  strict: process.env.NODE_ENV !== "production",

  plugins: [
    createMutationsSharer({
      predicate: [
        "accounts/addAccountMut",
        "accounts/addNetworkToAccount",
        "accounts/changeAccountName",
        "accounts/deleteAccount",
        "accounts/deleteAllAccounts",
        "accounts/setIsExist",
        "accounts/updateBalanceByAddressMut",
        "keystore/removeAllKey",
        "keystore/removeKey",
        "keystore/saveKeyMut",
        "networks/addNetwork",
        "wallet/setActiveAccountAddress",
        "wallet/setIsStoreRestored",
        "wallet/setNetwork",
        "setPopupId",
        "setIsLocked",
        "tasks/createTaskMut",
        "tasks/putTaskMut",
        "action/setTasks",
        "action/setCurrentTaskCancellation",
        "action/setCurrentTaskProcess",
        "action/clear",
      ],
      strategy: new BroadcastChannelStrategy(),
    }),
    vuexLocal.plugin,
  ],
});
