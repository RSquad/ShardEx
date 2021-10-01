<template>
  <VDialog light v-model="model" max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>{{ $t("insufficientFunds") }}</h3> </VCardTitle
      ><VCardText>{{ $t("requiredFunds") }}</VCardText>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { Component, VModel, Vue } from "vue-property-decorator";

@Component
export default class InsufficientFundsModal extends Vue {
  @VModel() model: boolean;
}
</script>
