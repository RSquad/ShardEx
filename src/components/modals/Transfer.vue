<template>
  <div class="transfer">
    <div class="text-center transfer__icon">
      <v-icon>mdi-cash-multiple</v-icon>
    </div>
    <template v-if="!isCurrentAddress">
      <div class="text-body-1">From address:</div>
      <addr :address="walletAddress" class="transfer__address" />
    </template>
    <div class="text-body-1">To address:</div>
    <addr :address="address" class="transfer__address" />
    <div>{{ amountView }}</div>
  </div>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
    amount: String,
    address: String,
    walletAddress: String,
    isCurrentAddress: Boolean,
  },
  computed: {
    amountView() {
      return this.amount;
    },
  },
};
</script>

