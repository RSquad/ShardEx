// import TonApi from '@/api/ton';
import { store } from "../../../store/index";
import { interactiveTaskType } from "@/store/modules/tasks";

export default {
  name: "transfer",
  handle: async function(task: any) {
    const networkServer = store.getters["wallet/activeNetworkServer"];
    if (networkServer !== task.data.network) {
      throw new Error();
    }
    // const loggedWalletAddress = await walletLib.getWalletAddress();
    // if (undefined === task.data.walletAddress) {
    //   task.data.walletAddress = loggedWalletAddress;
    // }
    // const isItLoggedWalletAddress = walletLib.isAddressesMatch(loggedWalletAddress, task.data.walletAddress);
    // if (isItLoggedWalletAddress && !(await walletLib.isContractDeployed(networkId))) {
    //   await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    // }
    return await store.dispatch("tasks/createTask", {
      typeId: interactiveTaskType.transfer,
      networkServer,
      requestId: task.requestId,
      data: task.data,
      // params: { isItLoggedWalletAddress },
    });
  },
};
