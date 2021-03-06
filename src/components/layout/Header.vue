<template>
  <v-app-bar :height="90" class="v-app-bar" app flat>
    <Inner>
      <div class="d-flex align-center" :style="{ height: '100%' }">
        <RouterLink class="d-flex" to="/">
          <img class="v-app-bar__logo" src="@/assets/img/logo.png" alt="logo" />
        </RouterLink>
        <VSpacer />
        <VSelect
          :items="languagesForSelect"
          v-model="modelLanguage"
          item-text="title"
          item-value="value"
          hide-details
          dense
          outlined
          class="v-app-bar__lang-select"
          background-color="#FFFFFF"
          light
          :menu-props="{ light: true, 'offset-y': true }"
        />
        <VSelect
          :items="networksForSelect"
          v-model="modelNetwork"
          item-text="title"
          item-value="value"
          hide-details
          dense
          outlined
          class="v-app-bar__select"
          background-color="#FFFFFF"
          light
          :menu-props="{ light: true, 'offset-y': true }"
        />
        <VMenu
          bottom
          max-width="250px"
          min-width="250px"
          max-height="526px"
          rounded
          left
          offset-y
          nudge-bottom="10"
          v-if="accountsCount !== 0 && !getIsLocked"
        >
          <template v-slot:activator="{ on }">
            <VBtn
              width="40"
              height="40"
              :style="{ padding: 0, 'min-width': '40px !important' }"
              light
              x-small
              class="ml-5"
              v-on="on"
            >
              <img src="@/assets/img/settings.svg" alt="settings" />
            </VBtn>
          </template>
          <VCard light>
            <template v-if="!isEmpty(accounts)">
              <div class="d-flex justify-space-between align-center py-3 px-4">
                <h2>{{ $t("accounts") }}</h2>
                <VTooltip v-if="isPopup" bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <VIcon @click="expandView" v-bind="attrs" v-on="on">
                      mdi-arrow-expand-all
                    </VIcon>
                  </template>
                  <span>{{ $t("expandView") }}</span>
                </VTooltip>
              </div>
              <v-divider></v-divider>
              <VList max-height="185px" class="v-app-bar__list">
                <VListItemGroup
                  @change="onChange"
                  v-model="modelActiveAccountAddress"
                  color="primary"
                >
                  <VListItem
                    v-for="item in accounts"
                    :key="item.address"
                    :value="item.address"
                    :disabled="item.address === activeAccountAddress"
                  >
                    <VListItemContent>
                      <VListItemTitle v-text="item.name"></VListItemTitle>
                    </VListItemContent>
                  </VListItem>
                </VListItemGroup>
              </VList>
              <v-divider></v-divider>
            </template>

            <VList nav>
              <VListItem @click="onClickEasyAdd">
                <VListItemContent>
                  <VListItemTitle>{{ $t("easyAddAccount") }}</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem link to="/initialize/create">
                <VListItemContent>
                  <VListItemTitle>{{ $t("addAccount") }}</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem link to="/initialize/restore">
                <VListItemContent>
                  <VListItemTitle>{{ $t("restoreAccount") }}</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem link to="/change-password">
                <VListItemContent>
                  <VListItemTitle>{{ $t("changePassword") }}</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem @click="onClickResetWallet">
                <VListItemContent>
                  <VListItemTitle>{{ $t("resetAccount") }}</VListItemTitle>
                </VListItemContent>
              </VListItem>
            </VList>
          </VCard>
        </VMenu>
      </div>
    </Inner>
  </v-app-bar>
</template>


  <script lang="ts">
import { tonService } from "@/background";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { networksModuleMapper } from "@/store/modules/networks";

import { walletModuleMapper } from "@/store/modules/wallet";
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";

import { isEmpty } from "lodash";
import { Component, Inject, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { rootModuleMapper } from "@/store/root";
import { passwordModuleMapper } from "@/store/modules/password";
const Mappers = Vue.extend({
  methods: {
    ...walletModuleMapper.mapMutations([
      "setNetwork",
      "setActiveAccountAddress",
    ]),
    ...accountsModuleMapper.mapMutations([
      "deleteAccount",
      "deleteAllAccounts",
    ]),
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...keystoreModuleMapper.mapMutations(["removeKey", "removeAllKey"]),
    ...passwordModuleMapper.mapActions(["askPassword"]),

    isEmpty,
  },
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeNetworkServer",
      "activeAccountAddress",
      "isStoreRestored",
    ]),
    ...rootModuleMapper.mapGetters(["getIsLocked"]),
    ...accountsModuleMapper.mapGetters(["accounts", "accountsCount"]),
    ...networksModuleMapper.mapGetters(["networksForSelect"]),
    modelNetwork: {
      get() {
        return this.activeNetworkServer;
      },
      set(value: string) {
        this.setNetwork(value);
      },
    },
    modelActiveAccountAddress: {
      get() {
        return this.activeAccountAddress;
      },
      set(value: string) {
        this.setActiveAccountAddress(value);
      },
    },
  },
});

@Component({ components: { Inner } })
export default class Header extends Mappers {
  modelLanguage: "en" | "ru" = "en";
  languagesForSelect = [
    { title: "EN", value: "en" },
    { title: "RU", value: "ru" },
  ];

  @Watch("modelLanguage")
  onChangeLang(v: string) {
    this.$root.$i18n.locale = v;
  }

  onChange() {
    if (this.$route.path !== "/") {
      this.$router.push("/");
    }
  }

  @Inject() isPopup!: boolean;

  onClickEasyAdd() {
    this.askPassword().then(async (result: any) => {
      const seedPhrase: any = await generateSeed(tonService.client, 12);
      const keypair = await convertSeedToKeyPair(
        tonService.client,
        seedPhrase?.phrase,
        12
      );
      const { activeNetworkServer, accountsCount } = this;
      await this.addAccount({
        keypair,
        custodians: [`0x${keypair.public}`],
        walletType: "safe-multisig",
        networkServer: activeNetworkServer,
        name: `Account ${accountsCount + 1}`,
        client: tonService.client,
        password: result.password,
        seedPhrase: seedPhrase?.phrase,
        isRestoredWithKeyPair: false,
      });
      if (this.$route.path !== "/") this.$router.push("/");
    });
  }

  onClickResetWallet() {
    this.askPassword().then(() => {
      this.deleteAllAccounts();
      this.removeAllKey();
      this.setActiveAccountAddress(undefined);
      this.$router.push("/initialize");
    });
  }

  expandView() {
    const extensionURL = browser.runtime.getURL("index.html");
    browser.tabs.create({ url: extensionURL });
  }
}
</script>

<style lang="sass" scoped>
.v-app-bar
  &__logo
    margin-right: 16px
  &__select
    max-width: 200px
  &__lang-select
    max-width: 75px !important
  &__list
    overflow-y: auto
</style>