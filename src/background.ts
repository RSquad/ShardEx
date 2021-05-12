import { store } from "./store/index";
import { TonService } from "@/ton/ton.service";

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
