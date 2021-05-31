import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { accounts } from "./modules/accounts";
import { networks } from "./modules/networks";
import { wallet } from "./modules/wallet";
import { keystore } from "./modules/keystore";
import { password } from "./modules/password";
import { modals } from "./modules/modals";
import { tasks } from "./modules/tasks";
import { action } from "./modules/action";

class RootState {
  isLocked = false;
  popupId = null;
}

class RootGetters extends Getters<RootState> {
  public get getIsLocked(): boolean {
    return this.state.isLocked;
  }

  public get popupId() {
    return this.state.popupId;
  }

  public get isLoggedIn() {
    return !this.state.isLocked;
  }
}
class RootMutations extends Mutations<RootState> {
  public setIsLocked(v: boolean) {
    this.state.isLocked = v;
  }

  public setPopupId(v: any) {
    this.state.popupId = v;
  }
}
const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {
  async waitLoggedIn(): Promise<any> {
    if (!this.state.isLocked) {
      return;
    }
    await timeout(500);
    return await this.actions.waitLoggedIn();
  }
}

export const root = new Module({
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions,
  modules: {
    accounts,
    networks,
    wallet,
    keystore,
    password,
    modals,
    tasks,
    action,
  },
});

export const rootModuleMapper = createMapper(root);
