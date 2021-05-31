import { store } from "./store/index";
import { TonService } from "@/ton/ton.service";
import { Runtime } from "webextension-polyfill-ts";
import taskLib from "@/api/task";
import popupLib from "@/api/popup";

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
  try {
    //@TODO make sure this check required
    if (extensionId !== sender.id) {
      throw "extensionId <> senderId";
    }
    //@TODO make sure can check it like this
    const isInternalRequest = sender.origin === `chrome-extension://${extensionId}`;
    let task;
    if (isInternalRequest) {
      task = taskLib.compileInternalTaskByRequest(request);
      console.log("isInternalRequest", task);
    } else {
      //@TODO site connection:  console.log({eventPageSender: sender});
      result.requestId = request.requestId;
      task = taskLib.compileExternalTaskByRequest(request, sender.tab.id);
    }

    if (task.isInteractive) {
      const interactiveTask = await taskLib.handleExternalInteractiveTask(task);
      await popupLib.callPopup();
      result.data = await taskLib.waitInteractiveTaskResolving(task, interactiveTask.id);
      result.code = 0;
    } else {
      if (!isInternalRequest && !(await store.getters["isLoggedIn"])) {
        await popupLib.callPopup();
        await store.dispatch("waitLoggedIn");
      }
      result.data = isInternalRequest
        ? await taskLib.handleInternalTask(task)
        : await taskLib.handleExternalBackgroundTask(task);
      console.log(result);
      result.code = 0;
    }
  } catch (e) {
    console.error(e);
    result.code = 1;
    result.error = e.toString();
  }
  return result;
};

browser.runtime.onMessage.addListener(function(request: any, sender: Runtime.MessageSender): void {
  if (undefined === request.method) {
    return;
  }
  // @ts-ignore
  return handleMessage(request, sender);
});
