<template>
  <v-app>
    <TypePasswordModal
      v-model="modelPassword"
      :isOpen="isDialogShowing"
      :resolvePromise="confirm"
      :rejectPromise="cancel"
      :passwordErrors="passwordErrors"
    />
    <ConfirmTransactionModal />
    <ActionDialog />

    <Header />
    <v-main>
      <v-container fluid class="pa-0">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Header from "@/components/layout/Header.vue";
import { tonService } from "@/background";
import { walletModuleMapper } from "@/store/modules/wallet";
import TypePasswordModal from "@/components/modals/TypePasswordModal.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { store } from "@/store";
import { checkDeployStatus } from "@/ton/ton.utils";
import { keystoreModuleMapper } from "@/store/modules/keystore";

import "@/styles/font.sass";
import { passwordModuleMapper } from "@/store/modules/password";
import ConfirmTransactionModal from "../modals/ConfirmTransactionModal.vue";
import ActionDialog from "../modals/ActionDialog.vue";

import { actionModuleMapper } from "@/store/modules/action";

const Mappers = Vue.extend({
  methods: {
    ...accountsModuleMapper.mapActions(["updateBalanceByAddress"]),
    ...accountsModuleMapper.mapMutations([
      "updateBalanceByAddressMut",
      "addNetworkToAccount",
    ]),
    ...passwordModuleMapper.mapMutations([
      "confirm",
      "cancel",
      "onPasswordChange",
    ]),
    ...actionModuleMapper.mapActions(["startTaskUpdating"]),
  },
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkServer",
    ]),
    ...accountsModuleMapper.mapGetters(["getAccountByAddress"]),
    ...keystoreModuleMapper.mapGetters([
      "getKeyIDs",
      "getPrivateData",
      "getPublicKeyData",
    ]),
    ...passwordModuleMapper.mapGetters([
      "isDialogShowing",
      "passwordErrors",
      "password",
    ]),
    ...actionModuleMapper.mapGetters(["currentTask"]),
    modelPassword: {
      get() {
        return this.password;
      },
      set(value: string) {
        this.onPasswordChange(value);
      },
    },
  },
});

@Component({
  components: {
    Header,
    TypePasswordModal,
    ConfirmTransactionModal,
    ActionDialog,
  },
})
export default class Layout extends Mappers {
  timeoutID: NodeJS.Timeout;
  isAccountOrNetworkChanged = false;

  isMounted = false;

  public get accountAndNetwork() {
    const { activeAccountAddress, activeNetworkServer } = this;
    return { activeAccountAddress, activeNetworkServer };
  }

  public get isDeployed(): boolean {
    const account = this.getAccountByAddress(this.activeAccountAddress);
    if (account) {
      return account.networks.includes(this.activeNetworkServer);
    }
    return false;
  }

  @Watch("accountAndNetwork")
  async onChangeAccount(val: {
    activeAccountAddress: string | undefined;
    activeNetworkServer: number;
  }) {
    if (this.isMounted) {
      if (val.activeAccountAddress && tonService.client.net) {
        const isExist = await checkDeployStatus(
          tonService.client,
          val.activeAccountAddress,
          [0, 1, 2]
        );

        if (isExist) {
          await this.updateBalance(this.activeAccountAddress);
          clearTimeout(this.timeoutID);
          this.timeoutID = setInterval(async () => {
            await this.updateBalance(this.activeAccountAddress);
          }, 8000);
        } else {
          this.updateBalanceByAddressMut({
            address: val.activeAccountAddress,
            symbol: "TON",
            newBalance: "0",
          });
        }
      }
    }
  }

  @Watch("activeNetworkServer")
  async onChangeNetwork() {
    if (this.activeAccountAddress) {
      if (!this.isDeployed) {
        const isUnInit = await checkDeployStatus(
          tonService.client,
          this.activeAccountAddress,
          [0]
        );
        if (isUnInit === false) {
          this.addNetworkToAccount({
            address: this.activeAccountAddress,
            networkServer: this.activeNetworkServer,
          });
        }
      }
    }
  }

  async mounted() {
    // @ts-ignore
    store.restored.then(async () => {
      this.isMounted = true;
      if (this.activeAccountAddress && tonService.client.net) {
        const isExist = await checkDeployStatus(
          tonService.client,
          this.activeAccountAddress,
          [0, 1, 2]
        );
        if (isExist) {
          this.timeoutID = setInterval(async () => {
            await this.updateBalance(this.activeAccountAddress);
          }, 3000);
        } else {
          this.updateBalanceByAddressMut({
            address: this.activeAccountAddress,
            symbol: "TON",
            newBalance: "0",
          });
        }
      }
      this.startTaskUpdating();
    });
  }

  beforeUnmount() {
    clearTimeout(this.timeoutID);
  }

  async updateBalance(address: string | undefined) {
    if (address)
      await this.updateBalanceByAddress({
        address,
        symbol: "TON",
        client: tonService.client,
      });
  }
}
</script>

