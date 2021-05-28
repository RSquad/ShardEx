import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

class ModalsState {
  isDialogShowing = false;
  resolve: any = null;
  reject: any = null;
}

class ModalsGetters extends Getters<ModalsState> {
  public get isDialogShowing(): boolean {
    return this.state.isDialogShowing;
  }
}

class ModalsMutations extends Mutations<ModalsState> {
  public init(payload: any) {
    this.state.isDialogShowing = payload.isDialogShowing;
    this.state.resolve = payload.resolve;
    this.state.reject = payload.reject;
  }

  public confirm() {
    this.state.resolve();
  }

  public cancel() {
    this.state.reject();
  }

  public setIsDialogShowing(payload: boolean) {
    this.state.isDialogShowing = payload;
  }
}

class ModalsActions extends Actions<ModalsState, ModalsGetters, ModalsMutations, ModalsActions> {
  confirmTransaction() {
    return new Promise((resolve, reject) => {
      this.mutations.init({
        isDialogShowing: true,
        resolve: () => {
          resolve(true);
          this.mutations.setIsDialogShowing(false);
        },
        reject: () => {
          reject(false);
          this.mutations.setIsDialogShowing(false);
        },
      });
    });
  }
}

export const modals = new Module({
  state: ModalsState,
  getters: ModalsGetters,
  mutations: ModalsMutations,
  actions: ModalsActions,
});

export const modalsModuleMapper = createMapper(modals);
