<template>
  <div class="transfer-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">{{ $t("createTransfer") }}</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model="address"
          clearable
          outlined
          :label="$t('address')"
          :rules="[(v) => !!v || $t('addressRequired')]"
        ></VTextField>

        <VTextField
          autocomplete="off"
          dense
          v-model.trim="amount"
          clearable
          outlined
          :label="$t('amount')"
          :rules="[
            (v) => !!`${v}` || $t('amountTypeRequired'),
            (v) => validateAmount(v),
          ]"
          :hint="`${$t('yourBalance')}: ${balance} EVER`"
        ></VTextField>

        <VTextField
          autocomplete="off"
          dense
          class="mb-5"
          v-model.trim="message"
          outlined
          hide-details
          :label="$t('message')"
        ></VTextField>

        <div class="d-flex justify-end">
          <VBtn light x-small width="80" to="/" class="mr-4">
            {{ $t("back") }}
          </VBtn>
          <VBtn
            x-small
            width="80"
            :loading="isPending"
            color="primary"
            type="submit"
            :disabled="!valid"
            >{{ $t("create") }}
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { assetToBaseAmount, baseToAssetAmount } from "@/utils";
import BigNumber from "bignumber.js";
import { passwordModuleMapper } from "@/store/modules/password";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    ...accountsModuleMapper.mapGetters(["getTokenBySymbol"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["transferOrProposeTransfer"]),
    ...passwordModuleMapper.mapActions(["askPassword"]),
  },
});

@Component({
  components: { Inner },
})
export default class TransferPage extends Mappers {
  valid = true;

  isPending = false;

  address = "";
  amount = "";
  message = "";

  public get balance(): string {
    if (this.activeAccountAddress) {
      const token = this.getTokenBySymbol(this.activeAccountAddress, "EVER");
      if (token) {
        return baseToAssetAmount(token.balance, "EVER", 3);
      }
    }
    return "";
  }

  validateAmount(v: string) {
    const isBalanceLessThenValue = new BigNumber(this.balance)
      .minus(0.011)
      .isLessThanOrEqualTo(v);
    if (isBalanceLessThenValue) {
      return `Insufficient funds. Your balance ${this.balance}`;
    }
    return true;
  }

  async onSubmit() {
    this.askPassword(this.activeAccountAddress).then(async (result: any) => {
      if (this.activeAccountAddress) {
        this.isPending = true;
        await this.transferOrProposeTransfer({
          addressFrom: this.activeAccountAddress,
          addressTo: this.address,
          amount: assetToBaseAmount(this.amount, "EVER"),
          client: tonService.client,
          message: this.message,
          keypair: result.keypair,
        });
        this.isPending = false;
        this.$router.push("/");
      }
    });
  }
}
</script>

