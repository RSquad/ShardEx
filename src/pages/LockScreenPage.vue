<template>
  <div class="v-lock-screen-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">{{ $t("unlockWallet") }}</h1>
        <VTextField
          autocomplete="off"
          class="mb-6"
          v-model.trim="password"
          clearable
          :rules="[
            (v) => !!v || $t('passwordRequired'),
            (v) => validatePassword(v, $t('validatePassword')),
          ]"
          outlined
          :label="$t('password')"
          dense
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          :error-messages="passwordErrors"
        ></VTextField>

        <div class="d-flex justify-center">
          <VBtn
            width="100"
            x-small
            color="primary"
            type="submit"
            :disabled="!password"
          >
            {{ $t("unlock") }}
          </VBtn>
        </div>
      </VForm></Inner
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { rootModuleMapper } from "@/store/root";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { validatePassword } from "@/utils/validation";

const Mappers = Vue.extend({
  computed: {
    ...keystoreModuleMapper.mapGetters(["getKeyIDs", "getPrivateData"]),
  },
  methods: {
    ...rootModuleMapper.mapMutations(["setIsLocked"]),
  },
});

@Component({
  components: { Inner },
  methods: { validatePassword },
})
export default class LockScreenPage extends Mappers {
  valid = true;

  password = "";
  passwordErrors: string[] = [];

  isHidePassword = true;

  @Watch("password")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }

  onSubmit() {
    try {
      this.getPrivateData({
        keyID: this.getKeyIDs[0],
        password: this.password,
      });
      this.setIsLocked(false);
      this.$router.push("/");
    } catch (error) {
      this.passwordErrors = [this.$t("invalidPassword").toString()];
    }
  }
}
</script>

