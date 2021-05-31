import { store } from "@/store";
import { interactiveTaskStatus, interactiveTaskType } from "@/store/modules/tasks";

export default {
  name: "applyInteractiveTask",
  async handle(task: any) {
    const { interactiveTaskId, password, form } = task.data;
    const interactiveTask = await store.getters["tasks/getTask"](interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.new) {
      interactiveTask.statusId = interactiveTaskStatus.process;
      interactiveTask.error = null;
      await store.dispatch("tasks/updateTasks", [interactiveTask]);

      const result = {};
      try {
        //@TODO refactoring
        const address = store.getters["wallet/activeAccountAddress"];
        const networkServer = store.getters["wallet/activeNetworkServer"];
        const server = networkServer;
        // if (wallet.isKeysEncrypted) {
        //   wallet.keys = await keystoreLib.decrypt(server, wallet.keys, password);
        // }
        console.log(address, server);
        switch (interactiveTask.typeId) {
          case interactiveTaskType.transfer: {
            // if (walletLib.isAddressesMatch(wallet.address, interactiveTask.params.walletAddress)) {
            //   const amountWithFee = BigInt("11000000") + BigInt(interactiveTask.params.amount);
            //   _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            // }
            // const message = await walletLib.createTransferMessage(
            //   server,
            //   wallet,
            //   interactiveTask.params.walletAddress,
            //   interactiveTask.params.address,
            //   interactiveTask.params.amount,
            //   interactiveTask.params.bounce,
            //   interactiveTask.params.payload || ""
            // );
            // const processingState = await TonApi.sendMessage(server, message);
            // result = { processingState, message };
            break;
          }
          default: {
            throw "Unknown interactive type.";
          }
        }
        interactiveTask.statusId = interactiveTaskStatus.performed;
        interactiveTask.result = result;
        // if (interactiveTask.data.callback !== undefined) {
        //   const frontPostApply = await interactiveTaskCallback.call(interactiveTask.data.callback);
        //   if (typeof frontPostApply !== "undefined") {
        //     interactiveTask.data.frontPostApply = frontPostApply;
        //   }
        // }
      } catch (e) {
        console.error(e);
        interactiveTask.statusId = interactiveTaskStatus.new;
        interactiveTask.error = "Error";
        throw e;
      } finally {
        await store.dispatch("tasks/updateTasks", [interactiveTask]);
      }
    }

    const interactiveTasks = store.getters["tasks/getAll"];

    return { interactiveTasks, interactiveTask };
  },
};
