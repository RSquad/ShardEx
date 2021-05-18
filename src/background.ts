import { store } from "./store/index";
import { TonService } from "@/ton/ton.service";
import { Runtime } from "webextension-polyfill-ts";

browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.tabs.create({ url: "index.html#/initialize" });
  }
});

export const tonService = new TonService();

(store as any).restored.then(() => {
  const server = store.state.wallet.activeNetworkServer;
  store.commit("wallet/setIsStoreRestored", true);
  tonService.setNetwork(server);
});

store.subscribe((mutation) => {
  if (mutation.type === "wallet/setNetwork") {
    const server = store.state.wallet.activeNetworkServer;
    tonService.setNetwork(server);
  }
});

const extensionId = browser.runtime.id;

const handleMessage = async (request: any, sender: any) => {
  const result: any = {};

  if (extensionId !== sender.id) {
    throw "extensionId <> senderId";
  }

  const isInternalRequest = sender.origin === `chrome-extension://${extensionId}`;
  return result;
};

// @ts-ignore
browser.runtime.onMessage.addListener(function(request: any, sender: Runtime.MessageSender, sendResponse: any): void {
  if (undefined === request.method) {
    return;
  }
  handleMessage(request, sender).then((result) => sendResponse(result));
});
