import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import { Store } from "vuex";

class PasswordState {
  isDialogShowing = false;
  password: any = null;
  passwordErrors: string[] = [];
  resolve: any = null;
  reject: any = null;
}

class PasswordGetters extends Getters<PasswordState> {
  public get isDialogShowing(): boolean {
    return this.state.isDialogShowing;
  }

  public get password(): string {
    return this.state.password;
  }

  public get passwordErrors(): string[] {
    return this.state.passwordErrors;
  }
}

class PasswordMutations extends Mutations<PasswordState> {
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

  public onPasswordChange(v: string) {
    this.state.password = v;
    this.state.passwordErrors = [];
  }

  public setPasswordsErrors(payload: any) {
    this.state.passwordErrors = payload;
  }
}

class PasswordActions extends Actions<PasswordState, PasswordGetters, PasswordMutations, PasswordActions> {
  store!: Store<any>;

  $init(store: Store<any>): void {
    this.store = store;
  }

  askPassword(address?: string) {
    return new Promise((resolve, reject) => {
      this.mutations.init({
        isDialogShowing: true,
        resolve: () => {
          try {
            if (address) {
              const privateData = this.store.getters["keystore/getPrivateData"]({
                keyID: address,
                password: this.state.password,
              });

              const keypair = {
                public: this.store.getters["keystore/getPublicKeyData"](address),
                secret: privateData.secret,
              };
              resolve({
                password: this.state.password,
                keypair,
                seedPhrase: privateData.seedPhrase,
              });
            } else {
              this.store.getters["keystore/getPrivateData"]({
                keyID: this.store.getters["keystore/getKeyIDs"][0],
                password: this.state.password,
              });
              resolve({ password: this.state.password });
            }
            this.mutations.onPasswordChange("");
            this.mutations.setIsDialogShowing(false);
          } catch (error) {
            this.mutations.setPasswordsErrors(["Invalid password"]);
          }
        },
        reject: () => {
          reject(false);
          this.mutations.onPasswordChange("");
          this.mutations.setIsDialogShowing(false);
        },
      });
    });
  }
}

export const password = new Module({
  state: PasswordState,
  getters: PasswordGetters,
  mutations: PasswordMutations,
  actions: PasswordActions,
});

export const passwordModuleMapper = createMapper(password);
