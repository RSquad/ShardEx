<template>
  <VDialog light v-model="isDialogShowing" persistent max-width="325px">
    <v-form v-model="valid" ref="form" lazy-validation>
      <VCard v-if="currentTask" class="actionDialog__card">
        <div>
          <VCardTitle class="actionDialog__card__title">
            <h3>{{ action }}</h3>
          </VCardTitle>
          <VCardSubtitle
            v-if="activeTasksAmount > 1"
            class="actionDialog__card__subtitle text-overline"
          >
            Action 1 of {{ activeTasksAmount }}
          </VCardSubtitle>
          <VCardText class="actionDialog__card__body">
            <div v-if="currentTask.error" class="error--text">
              {{ currentTask.error }}
            </div>

            <SendTransaction
              v-if="currentTask.typeId === interactiveTaskType.sendTransaction"
              @formChange="formChange"
              :form="currentTask.form"
              :disabled="!isApplyButtonEnabled"
              :amount="currentTask.data.amount"
              :address="currentTask.data.address"
              :wallet-address="currentTask.data.walletAddress"
              :is-current-address="currentTask.params.isItLoggedWalletAddress"
            />
          </VCardText>
        </div>
        <div>
          <v-divider></v-divider>
          <VCardActions>
            <VBtn
              @click="cancel(currentTask.id)"
              :disabled="!isCancelButtonEnabled"
              :loading="isCancelButtonLoading"
              text
              x-small
            >
              Cancel
            </VBtn>
            <VSpacer></VSpacer>
            <VBtn
              @click="submit"
              color="primary"
              :disabled="!isApplyButtonEnabled"
              :loading="isApplyButtonLoading"
              x-small
            >
              Submit
            </VBtn>
          </VCardActions>
        </div>
      </VCard>
    </v-form>
  </VDialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import SendTransaction from "@/components/modals/SendTransaction.vue";
import { interactiveTaskType } from "@/store/modules/tasks";
import { actionModuleMapper } from "@/store/modules/action";
import { passwordModuleMapper } from "@/store/modules/password";
import { sliceString } from "@/utils";

const Mappers = Vue.extend({
  computed: {
    ...actionModuleMapper.mapGetters([
      "currentTask",
      "isDialogShowing",
      "activeTasksAmount",
      "isCancelButtonEnabled",
      "isCancelButtonLoading",
      "isApplyButtonEnabled",
      "isApplyButtonLoading",
    ]),
  },
  methods: {
    ...actionModuleMapper.mapActions(["cancel", "apply", "formChange"]),
    ...passwordModuleMapper.mapActions(["askPassword"]),
  },
});

@Component({ components: { SendTransaction }, methods: { sliceString } })
export default class ActionModal extends Mappers {
  valid = true;
  data() {
    return {
      interactiveTaskType,
    };
  }

  actions = ["Send transaction"];
  public get action(): string {
    return this.actions[+this.currentTask.typeId - 1];
  }

  async submit() {
    const form: any = this.$refs.form;
    await form.validate();
    if (this.valid) {
      const applyData = { interactiveTask: this.currentTask, password: null };
      this.askPassword()
        .then(async (data) => {
          applyData.password = data.password;
          await this.apply(applyData);
        })
        .catch(() => null);
    }
  }
}
</script>
