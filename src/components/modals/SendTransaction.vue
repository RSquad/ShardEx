<template>
  <div>
    <div class="text-body-1"><b>From address:</b> {{ fWalletAddress }}</div>
    <div class="text-body-1"><b>To address:</b> {{ fAddress }}</div>
    <div><b>Amount:</b> {{ fAmount }}</div>
  </div>
</template>

<script lang="ts">
import { baseToAssetAmount, sliceString } from "@/utils";
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class SendTransaction extends Vue {
  @Prop() disabled: boolean;
  @Prop() amount: string;
  @Prop() address: string;
  @Prop() walletAddress: string;
  @Prop() isCurrentAddress: string;

  public get fWalletAddress(): string {
    return sliceString(this.walletAddress);
  }

  public get fAddress(): string {
    return sliceString(this.address);
  }

  public get fAmount(): string {
    return baseToAssetAmount(this.amount, "TON");
  }
}
</script>
