import { store } from "@/store";
import { interactiveTaskStatus, interactiveTaskType } from "@/store/modules/tasks";
import { tonService } from "../../../background";
import TonContract from "@/ton/ton.contract";
import { contracts } from "@/store/modules/accounts";

export default {
  name: "applyInteractiveTask",
  async handle(task: any) {
    const { interactiveTaskId, password, form } = task.data;
    const interactiveTask = store.getters["tasks/getTask"](interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.new) {
      interactiveTask.statusId = interactiveTaskStatus.process;
      interactiveTask.error = null;
      await store.dispatch("tasks/updateTasks", [interactiveTask]);

      let result = {};
      try {
        //@TODO refactoring
        // const address = store.getters["wallet/activeAccountAddress"];
        const networkServer = store.getters["wallet/activeNetworkServer"];
        // const server = networkServer;

        const privateData = store.getters["keystore/getPrivateData"]({
          keyID: interactiveTask.data.walletAddress,
          password,
        });

        const keypair = {
          public: store.getters["keystore/getPublicKeyData"](interactiveTask.data.walletAddress),
          secret: privateData.secret,
        };

        switch (interactiveTask.typeId) {
          case interactiveTaskType.sendTransaction: {
            // if (walletLib.isAddressesMatch(wallet.address, interactiveTask.data.walletAddress)) {
            //   const amountWithFee = BigInt("11000000") + BigInt(interactiveTask.data.amount);
            //   _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            // }
            // const message = await walletLib.createTransferMessage(
            //   server,
            //   wallet,
            //   interactiveTask.data.walletAddress,
            //   interactiveTask.data.address,
            //   interactiveTask.data.amount,
            //   interactiveTask.data.bounce,
            //   interactiveTask.data.payload || ""
            // );
            // const processingState = await TonApi.sendMessage(server, message);
            const contract = new TonContract({
              client: tonService.client,
              tonPackage: contracts["safe-multisig"],
              name: "safe-multisig",
              keys: keypair,
              address: interactiveTask.data.walletAddress,
            });

            const response = await contract.call({
              functionName: "submitTransaction",
              input: {
                dest: interactiveTask.data.address,
                value: interactiveTask.data.amount,
                bounce: false,
                allBalance: false,
                payload: interactiveTask.data.body,
              },
            });
            result = response;
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
