<template>
  <VDialog light v-model="isOpen" persistent max-width="325px">
    <VCard>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="resolvePromise"
      >
        <VCardTitle>
          <h3>{{ $t("typeYourPassword") }}</h3>
        </VCardTitle>
        <VCardText class="pb-0">
          <VTextField
            dense
            autocomplete="off"
            v-model.trim="password"
            clearable
            autofocus
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
          ></VTextField
        ></VCardText>
        <v-card-actions>
          <VSpacer></VSpacer>
          <VBtn x-small text @click="rejectPromise()">
            {{ $t("cancel") }}
          </VBtn>
          <VBtn x-small text type="submit"> {{ $t("submit") }} </VBtn>
        </v-card-actions>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { sliceString } from "@/utils";
import { validatePassword } from "@/utils/validation";
import { Component, ModelSync, Prop, Vue, Watch } from "vue-property-decorator";

@Component({ methods: { sliceString, validatePassword } })
export default class TypePasswordModal extends Vue {
  valid = true;

  @ModelSync("change", "value", { type: String })
  password!: boolean;

  isHidePassword = true;

  @Watch("isOpen")
  onChange() {
    this.isHidePassword = true;
  }

  @Prop() isOpen: boolean;
  @Prop() resolvePromise: any;
  @Prop() rejectPromise: any;
  @Prop() passwordErrors: string[];
}
</script>
