<template>
  <VDialog light :retain-focus="false" v-model="model" max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>{{ $t("AccountDetails") }}</h3>
      </VCardTitle>
      <VCardText>
        <VTextField
          autocomplete="off"
          v-model.trim="modelAccountName"
          clearable
          :rules="[(v) => !!v || $t('nameIsRequired')]"
          outlined
          :label="$t('name')"
        >
        </VTextField>
        <h4>{{ $t("walletType") }}</h4>
        <div class="mb-4">{{ account && account.walletType }}</div>
        <h4>{{ $t("publicKey") }}</h4>
        <div class="d-flex justify-space-between align-center mb-4">
          {{ sliceString(publicKey, 12) }}
          <VBtn
            x-small
            v-clipboard="() => publicKey"
            type="button"
            icon
            class="ml-2"
          >
            <VIcon> mdi-content-copy </VIcon>
          </VBtn>
        </div>
        <h4>{{ $t("custodians") }}</h4>
        <div>
          <div
            v-for="(custodian, i) in account.custodians"
            :key="i"
            class="d-flex justify-space-between align-center"
          >
            {{ sliceString(custodian, 14) }}
            <VBtn
              x-small
              v-clipboard="() => custodian"
              type="button"
              icon
              class="ml-2"
            >
              <VIcon> mdi-content-copy </VIcon>
            </VBtn>
          </div>
        </div>
        <div class="mt-4" v-if="!account.isRestoredWithKeyPair">
          <VBtn
            x-small
            @click="onClickExportSeedPhrase"
            v-if="!seedPhrase"
            width="100%"
            color="primary"
          >
            {{ $t("exportSeedPhrase") }}</VBtn
          >
          <VTextarea
            v-if="seedPhrase"
            outlined
            v-model="seedPhrase"
            auto-grow
            rows="3"
            readonly
            hide-details
            :label="$t('seedPhrase')"
          ></VTextarea>
        </div>
        <VBtn
          x-small
          @click="onClickExportSecretPhrase"
          v-if="!secretKey"
          width="100%"
          color="primary"
          class="mt-4"
        >
          {{ $t("exportSecretKey") }}</VBtn
        >
        <VTextarea
          v-if="secretKey"
          outlined
          v-model="secretKey"
          auto-grow
          rows="3"
          hide-details
          readonly
          :label="$t('secretKey')"
          class="mt-4"
        ></VTextarea>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { passwordModuleMapper } from "@/store/modules/password";
import { walletModuleMapper } from "@/store/modules/wallet";
import { sliceString } from "@/utils";
import { Component, Prop, VModel, Vue, Watch } from "vue-property-decorator";

const Mappers = Vue.extend({
  computed: {
    ...keystoreModuleMapper.mapGetters(["getPublicKeyData"]),
    ...accountsModuleMapper.mapGetters(["accountNameByAddress"]),
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    modelAccountName: {
      get() {
        return this.accountNameByAddress(this.activeAccountAddress);
      },
      set(value: string) {
        this.changeAccountName({
          address: this.activeAccountAddress,
          newName: value,
        });
      },
    },
  },
  methods: {
    ...accountsModuleMapper.mapMutations(["changeAccountName"]),
    ...passwordModuleMapper.mapActions(["askPassword"]),
  },
});

@Component({ methods: { sliceString } })
export default class AccountDetailsModal extends Mappers {
  @VModel() model: boolean;
  @Prop() account: AccountInterface;
  valid = true;

  secretKey = "";
  seedPhrase = "";

  public get publicKey(): string {
    if (this.activeAccountAddress) {
      return this.getPublicKeyData(this.activeAccountAddress);
    }
    return "";
  }

  onClickExportSeedPhrase() {
    this.askPassword(this.activeAccountAddress).then(async (result: any) => {
      this.seedPhrase = result.seedPhrase;
    });
  }

  onClickExportSecretPhrase() {
    this.askPassword(this.activeAccountAddress).then(async (result: any) => {
      this.secretKey = result.keypair.secret;
    });
  }

  @Watch("model")
  onChangeModel() {
    this.seedPhrase = "";
    this.secretKey = "";
  }
}
</script>
