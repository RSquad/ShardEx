import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import { defaultNetworks } from "./networks";
export type Network = "http://0.0.0.0" | "http://net.ton.dev" | "http://main.ton.dev";
class WalletState {
  isStoreRestored = false;
  activeNetworkServer = defaultNetworks[0].server;
  activeAccountAddress: string | undefined = undefined;
}

class WalletGetters extends Getters<WalletState> {
  public get isStoreRestored(): boolean {
    return this.state.isStoreRestored;
  }

  public get activeNetworkServer() {
    return this.state.activeNetworkServer;
  }

  public get activeAccountAddress() {
    return this.state.activeAccountAddress;
  }
}

class WalletMutations extends Mutations<WalletState> {
  setIsStoreRestored(payload: boolean) {
    this.state.isStoreRestored = payload;
  }

  setNetwork(payload: string) {
    this.state.activeNetworkServer = payload;
  }

  setActiveAccountAddress(address: string | undefined) {
    this.state.activeAccountAddress = address;
  }
}

class WalletActions extends Actions<WalletState, WalletGetters, WalletMutations, WalletActions> {}

export const wallet = new Module({
  state: WalletState,
  getters: WalletGetters,
  mutations: WalletMutations,
  actions: WalletActions,
});

export const walletModuleMapper = createMapper(wallet);
