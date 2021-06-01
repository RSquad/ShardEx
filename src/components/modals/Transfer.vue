<template>
  <div class="transfer">
    <div class="text-center transfer__icon">
      <v-icon>mdi-cash-multiple</v-icon>
    </div>
    <template v-if="!isCurrentAddress">
      <div class="text-body-1">From address:</div>
      <div>{{ walletAddress }}</div>
    </template>
    <div class="text-body-1">To address:</div>
    <div>{{ address }}</div>
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

