<template>
  <div class="v-restore-wallet-page pb-8">
    <TypePasswordModal ref="typePasswordModalRestoreWallet" />

    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">{{ $t("restoreAccount") }}</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model="name"
          clearable
          outlined
          :rules="[(v) => !!v || $t('nameIsRequired')]"
          :label="$t('name')"
        ></VTextField>
        <VSelect
          dense
          v-model="walletType"
          :items="walletsTypes"
          :label="$t('walletType')"
          outlined
          :menu-props="{ 'offset-y': true, light: true }"
        ></VSelect>
        <VSelect
          dense
          v-model="restoryType"
          :items="[
            {
              text: this.$t('seedPhrase'),
              value: 'seedPhrase',
            },
            {
              text: this.$t('keypair'),
              value: 'keypair',
            },
          ]"
          :label="$t('restoryType')"
          outlined
          :menu-props="{ 'offset-y': true, light: true }"
        ></VSelect>
        <VTextField
          autocomplete="off"
          dense
          v-if="restoryType === 'seedPhrase'"
          v-model.trim="seedPhrase"
          outlined
          :label="$t('seedPhrase')"
          :rules="[
            (v) => !!v || $t('seedPhraseRequired'),
            (v) => !iSSeedPhraseValid || $t('seedPhraseInvalid'),
          ]"
          :success-messages="seedPhraseTips"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-if="restoryType === 'keypair'"
          v-model.trim="publicKey"
          outlined
          :label="$t('publicKey')"
          :rules="[
            (v) => !!v || $t('publicKeyRequired'),
            (v) => !iSSeedPhraseValid || $t('publicKeyRequired'),
          ]"
          :success-messages="seedPhraseTips"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-if="restoryType === 'keypair'"
          v-model.trim="secretKey"
          outlined
          :label="$t('secretKey')"
          :rules="[
            (v) => !!v || $t('secretKeyRequired'),
            (v) => !iSSeedPhraseValid || 'Secret key is invalid',
          ]"
          :success-messages="seedPhraseTips"
        ></VTextField>
        <div
          v-if="
            restoryType === 'seedPhrase'
              ? !isEmpty(seedPhraseTips) && iSSeedPhraseValid
              : !isEmpty(keyPairTips) && publicKey && secretKey
          "
        >
          <div class="d-flex align-center justify-space-between mb-5">
            <h2>{{ $t("custodians") }}: {{ custodians.length }}</h2>
            <VBtn
              min-width="30"
              :style="{ padding: 0 }"
              x-small
              @click="addNewField(custodians.length)"
              color="primary"
            >
              <VIcon small> mdi-plus-thick</VIcon>
            </VBtn>
          </div>
          <VTextField
            autocomplete="off"
            dense
            v-for="(custodian, index) in custodians"
            :key="index"
            v-model.trim="custodians[index]"
            outlined
            :label="$t('custodian')"
            :rules="[(v) => !!`${v}` || $t('custodianRequired')]"
            :hint="$t('0x + Public key')"
          >
            <template v-slot:append>
              <div class="v-restore-wallet-page__btn-inner">
                <VBtn
                  min-width="30"
                  :style="{ padding: 0 }"
                  x-small
                  v-clipboard="() => custodian"
                  color="primary"
                >
                  <VIcon small> mdi-content-copy</VIcon>
                </VBtn>
                <VBtn
                  min-width="30"
                  :style="{ padding: 0 }"
                  x-small
                  @click="deleteByIndex(index)"
                  v-if="index !== 0"
                  class="ml-1"
                >
                  <VIcon small> mdi-close</VIcon>
                </VBtn>
              </div>
            </template>
          </VTextField>
        </div>
        <VTextField
          autocomplete="off"
          dense
          clearable
          v-if="accountsCount === 0"
          v-model.trim="password"
          :rules="[
            (v) => !!v || $t('passwordRequired'),
            (v) => validatePassword(v, $t('validatePassword')),
          ]"
          outlined
          :label="$t('password')"
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          :error-messages="passwordErrors"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          clearable
          v-if="accountsCount === 0"
          v-model.trim="confirmPassword"
          :rules="[
            (v) => !!v || $t('confirmPasswordRequired'),
            (v) => newPassword === v || 'Passwords don\'t match',
          ]"
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          outlined
          :label="$t('confirmPassword')"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn
            x-small
            light
            color="white"
            width="80"
            link
            @click="$router.back()"
            class="mr-4"
          >
            {{ $t("back") }}
          </VBtn>
          <VBtn
            x-small
            width="80"
            color="primary"
            type="submit"
            :disabled="
              restoryType === 'seedPhrase'
                ? !valid || !name || !seedPhrase
                : !valid || !name || (!publicKey && !secretKey)
            "
          >
            {{ $t("restore") }}
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import {
  accountsModuleMapper,
  WalletType,
  walletsTypes,
  contracts,
} from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { convertSeedToKeyPair, validateSeedPhrase } from "@/ton/ton.utils";
import TonContract from "@/ton/ton.contract";
import { KeyPair } from "@tonclient/core";
import { isEmpty } from "lodash";
import TypePasswordModal from "@/components/modals/TypePasswordModal.vue";
import { validatePassword } from "@/utils/validation";
import { passwordModuleMapper } from "@/store/modules/password";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkServer",
    ]),
    ...accountsModuleMapper.mapGetters(["accountsCount"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...accountsModuleMapper.mapMutations(["addNetworkToAccount"]),
    ...walletModuleMapper.mapMutations(["setActiveAccountAddress"]),
    ...passwordModuleMapper.mapActions(["askPassword"]),
  },
});

@Component({
  components: { Inner, TypePasswordModal },
  methods: { isEmpty, validatePassword },
})
export default class RestoreWalletPage extends Mappers {
  valid = true;

  name = "";
  walletType: WalletType = "safe-multisig";
  restoryType = "seedPhrase";
  seedPhrase = "";
  publicKey = "";
  secretKey = "";
  numberOfCustodians = 1;
  custodians = [""];

  password = "";
  confirmPassword = "";
  passwordErrors: string[] = [];

  isHidePassword = true;

  seedPhraseTips: string[] = [];
  keyPairTips: string[] = [];
  iSSeedPhraseValid = false;
  isDeployed = false;
  data() {
    return {
      walletsTypes,
    };
  }

  public get onChangeFields() {
    const {
      seedPhrase,
      walletType,
      activeNetworkServer,
      publicKey,
      secretKey,
    } = this;
    return {
      seedPhrase,
      walletType,
      activeNetworkServer,
      publicKey,
      secretKey,
    };
  }

  public get seedPhraseWorldCount(): number {
    return this.seedPhrase.split(" ").length;
  }

  @Watch("onChangeFields")
  async onChange() {
    try {
      if (this.restoryType === "seedPhrase") {
        const response = await validateSeedPhrase(
          tonService.client,
          this.seedPhrase,
          this.seedPhraseWorldCount
        );

        const isValid = response && response.valid;
        this.iSSeedPhraseValid = isValid;

        if (isValid) {
          const keypair = await this.getKeypair();
          this.custodians = [`0x${keypair.public}`];
          this.isDeployed = false;

          const contract = new TonContract({
            client: tonService.client,
            name: this.walletType,
            tonPackage: contracts[this.walletType],
            keys: keypair,
          });
          await contract.calcAddress();

          const response = await contract.run({
            functionName: "getCustodians",
          });

          const custodians = response.value.custodians;
          this.seedPhraseTips = [];
          if (custodians) {
            this.isDeployed = true;
            this.custodians = custodians.map(
              (custodian: any) => custodian.pubkey
            );
            this.numberOfCustodians = custodians.length;
          }
        }
      }
      if (this.restoryType === "keypair") {
        if (this.publicKey && this.secretKey) {
          this.custodians = [`0x${this.publicKey}`];
          this.isDeployed = false;

          const contract = new TonContract({
            client: tonService.client,
            name: this.walletType,
            tonPackage: contracts[this.walletType],
            keys: { public: this.publicKey, secret: this.secretKey },
          });
          await contract.calcAddress();

          const response = await contract.run({
            functionName: "getCustodians",
          });

          const custodians = response.value.custodians;
          this.keyPairTips = [];
          if (custodians) {
            this.isDeployed = true;
            this.custodians = custodians.map(
              (custodian: any) => custodian.pubkey
            );
            this.numberOfCustodians = custodians.length;
          }
        }
      }
    } catch (error) {
      if (this.restoryType === "seedPhrase") {
        this.seedPhraseTips.push("The account is not active, enter custodians");
      }
      if (this.restoryType === "keypair") {
        this.keyPairTips.push("The account is not active, enter custodians");
      }
    }
  }

  public async getKeypair(): Promise<KeyPair> {
    return await convertSeedToKeyPair(
      tonService.client,
      this.seedPhrase,
      this.seedPhraseWorldCount
    );
  }

  addNewField(i: number) {
    this.$set(this.custodians, i, "");
  }

  deleteByIndex(i: number) {
    this.$delete(this.custodians, i);
  }

  async onSubmit() {
    const {
      walletType,
      activeNetworkServer,
      name,
      getKeypair,
      custodians,
      isDeployed,
      password,
      seedPhrase,
    } = this;
    if (this.restoryType === "seedPhrase") {
      if (this.accountsCount === 0) {
        const keypair = await getKeypair();
        await this.addAccount({
          keypair,
          custodians,
          walletType,
          networkServer: activeNetworkServer,
          name,
          client: tonService.client,
          isDeployed,
          password,
          seedPhrase,
          isRestoredWithKeyPair: false,
        });
        this.$router.push("/");
      } else {
        this.askPassword().then(async (result: any) => {
          const keypair = await getKeypair();
          await this.addAccount({
            keypair,
            custodians,
            walletType,
            networkServer: activeNetworkServer,
            name,
            client: tonService.client,
            isDeployed,
            password: result.password,
            seedPhrase,
            isRestoredWithKeyPair: false,
          });
          this.$router.push("/");
        });
      }
    }
    if (this.restoryType === "keypair") {
      const keypair = {
        public: this.publicKey,
        secret: this.secretKey,
      };
      if (this.accountsCount === 0) {
        await this.addAccount({
          keypair,
          custodians,
          walletType,
          networkServer: activeNetworkServer,
          name,
          client: tonService.client,
          isDeployed,
          password,
          seedPhrase: "",
          isRestoredWithKeyPair: true,
        });
        this.$router.push("/");
      } else {
        this.askPassword().then(async (result: any) => {
          await this.addAccount({
            keypair,
            custodians,
            walletType,
            networkServer: activeNetworkServer,
            name,
            client: tonService.client,
            isDeployed,
            password: result.password,
            seedPhrase: "",
            isRestoredWithKeyPair: true,
          });
          this.$router.push("/");
        });
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.v-restore-wallet-page
  &__btn-inner
    margin-top: -3px
    margin-right: -7px
</style>