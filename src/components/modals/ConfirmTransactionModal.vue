<template>
  <VDialog light v-model="isDialogShowing" persistent max-width="325px">
    <VCard>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="confirm"
      >
        <VCardTitle>
          <h3>Confirm transaction?</h3>
        </VCardTitle>
        <v-card-text> </v-card-text>
        <v-card-actions>
          <VSpacer></VSpacer>
          <VBtn x-small text @click="cancel"> No </VBtn>
          <VBtn x-small text type="submit"> Yes </VBtn>
        </v-card-actions>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { modalsModuleMapper } from "@/store/modules/modals";
import { Component, Vue } from "vue-property-decorator";

const Mappers = Vue.extend({
  methods: {
    ...modalsModuleMapper.mapMutations(["confirm", "cancel"]),
  },
  computed: {
    ...modalsModuleMapper.mapGetters(["isDialogShowing"]),
  },
});

@Component
export default class ConfirmTransactionModal extends Mappers {
  valid = true;
}
</script>
