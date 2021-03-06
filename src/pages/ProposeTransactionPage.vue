<template>
  <div class="v-propose-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="proposeTx"
      >
        <h1 class="mb-5">{{ $t("proposeTransaction") }}</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model="multiCustodianWalletAddress"
          clearable
          outlined
          :label="$t('multiCustodianWalletAddress')"
          :rules="[
            (v) => !!v || $t('addressRequired'),
            (v) => validateAddress(v) || $t('invalidAddressFormat'),
          ]"
        ></VTextField>

        <VTextField
          autocomplete="off"
          dense
          v-model="toAddress"
          clearable
          outlined
          :label="$t('toAddress')"
          :rules="[
            (v) => !!v || $t('addressRequired'),
            (v) => validateAddress(v) || $t('invalidAddressFormat'),
          ]"
        ></VTextField>

        <VTextField
          autocomplete="off"
          dense
          v-model.trim="amount"
          clearable
          outlined
          :label="$t('amount')"
          :rules="[(v) => !!`${v}` || $t('amountTypeRequired')]"
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
          <VBtn color="white" light x-small width="80" to="/" class="mr-4">
            {{ $t("back") }}
          </VBtn>
          <VBtn
            x-small
            width="80"
            :loading="isPending"
            type="submit"
            color="primary"
            :disabled="
              !valid ||
              !multiCustodianWalletAddress ||
              !toAddress ||
              !amount ||
              !message
            "
            >{{ $t("propose") }}
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper, contracts } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import TonContract from "@/ton/ton.contract";
import { tonService } from "@/background";
import { assetToBaseAmount } from "@/utils";
import Transfer from "@/contracts/Transfer";
import { signerNone } from "@tonclient/core";
import { validateAddress } from "@/ton/ton.utils";
import { passwordModuleMapper } from "@/store/modules/password";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    ...accountsModuleMapper.mapGetters(["getAccountByAddress"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["transferOrProposeTransfer"]),
    ...passwordModuleMapper.mapActions(["askPassword"]),

    validateAddress,
  },
});

@Component({
  components: { Inner },
})
export default class TransferPage extends Mappers {
  valid = true;

  isCustodian: any = true;

  selected = [];

  isPending = false;

  multiCustodianWalletAddress = "";
  toAddress = "";
  amount = "";
  message = "";

  @Watch("multiCustodianWalletAddress")
  async onChangeAddress() {
    if (this.validateAddress(this.multiCustodianWalletAddress)) {
      const account = this.getAccountByAddress(this.activeAccountAddress);
      if (account) {
        const contract = new TonContract({
          client: tonService.client,
          address: this.multiCustodianWalletAddress,
          name: "safe-multisig",
          tonPackage: contracts["safe-multisig"],
        });
        if (contract) {
          try {
            const response = await contract.run({
              functionName: "getCustodians",
            });
            if (
              response.value.custodians
                .map((custodian: any) => custodian.pubkey)
                .includes(`0x${account.publicKey}`)
            ) {
              this.isCustodian = true;
            } else {
              this.isCustodian = false;
            }
          } catch (error) {
            this.isCustodian = false;
            throw new Error(error);
          }
        }
      }
    }
  }

  async proposeTx() {
    await this.askPassword(this.activeAccountAddress).then(
      async (result: any) => {
        if (this.activeAccountAddress) {
          const account = this.getAccountByAddress(this.activeAccountAddress);
          if (account) {
            this.isPending = true;

            const contract = new TonContract({
              client: tonService.client,
              address: this.multiCustodianWalletAddress,
              name: "safe-multisig",
              tonPackage: contracts["safe-multisig"],
            });
            let body = "";
            if (this.message) {
              body = (
                await tonService.client.abi.encode_message_body({
                  abi: { type: "Contract", value: Transfer.abi },
                  call_set: {
                    function_name: "transfer",
                    input: {
                      comment: Buffer.from(this.message).toString("hex"),
                    },
                  },
                  is_internal: true,
                  signer: signerNone(),
                })
              ).body;
            }
            await contract.call({
              functionName: "submitTransaction",
              input: {
                dest: this.toAddress,
                value: assetToBaseAmount(this.amount, "EVER"),
                bounce: false,
                allBalance: false,
                payload: body,
              },
              keys: result.keypair,
            });

            this.isPending = false;
            this.$router.push("/");
          }
        }
      }
    );
  }
}
</script>

<style lang="sass" scoped>
.v-propose-page
  &__table
    border: 1px solid #FFFFFF
    box-sizing: border-box
    border-radius: 5px
    background-color: #303540 !important
    .table-item > td
      padding: 8px !important
      border-bottom: none !important
</style>