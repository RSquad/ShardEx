<template>
  <div class="v-create-wallet-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">{{ $t("changePassword") }}</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="oldPassword"
          clearable
          :rules="[(v) => !!v || $t('oldPasswordRequired')]"
          outlined
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          :error-messages="passwordErrors"
          :label="$t('oldPassword')"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="newPassword"
          clearable
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          :rules="[
            (v) => !!v || $t('passwordRequired'),
            (v) => validatePassword(v, $t('validatePassword')),
          ]"
          outlined
          :label="$t('password')"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          v-model.trim="confirmNewPassword"
          clearable
          :rules="[
            (v) => !!v || $t('confirmPasswordRequired'),
            (v) => newPassword === v || $t('passwordsDontMatch'),
          ]"
          outlined
          :label="$t('confirmPassword')"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn x-small width="80" to="/" class="mr-4" light color="white">
            {{ $t("back") }}
          </VBtn>
          <VBtn
            x-small
            width="80"
            color="primary"
            type="submit"
            :disabled="!oldPassword || !newPassword || !confirmNewPassword"
          >
            {{ $t("change") }}
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { isEmpty } from "lodash";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { validatePassword } from "@/utils/validation";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeNetworkServer"]),
    ...accountsModuleMapper.mapGetters([
      "getAccountByAddress",
      "accountsCount",
    ]),
  },
  methods: {
    ...keystoreModuleMapper.mapActions(["changePassword"]),
    isEmpty,
  },
});

@Component({
  components: { Inner },
  methods: { validatePassword },
})
export default class ChangePasswordPage extends Mappers {
  valid = true;

  oldPassword = "";
  newPassword = "";
  confirmNewPassword = "";

  passwordErrors: string[] = [];
  isHidePassword = true;

  @Watch("oldPassword")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }
  async onSubmit() {
    const { oldPassword, newPassword } = this;
    try {
      this.changePassword({ password: oldPassword, newPassword });
      this.$router.push("/");
    } catch (error) {
      this.passwordErrors = [this.$t("invalidPassword").toString()];
    }
  }
}
</script>

