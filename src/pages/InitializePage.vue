<template>
  <div class="v-initialize-page">
    <Inner>
      <h1 class="text-center mb-8">Create or restore account</h1>
      <div class="v-initialize-page__cards">
        <VCard
          hover
          link
          to="/easy-add"
          width="300"
          class="v-initialize-page__cards-card pa-4 d-flex flex-column align-center justify-center"
        >
          <VIcon class="mb-4" size="40">mdi-plus</VIcon>
          <h2>Easy Add</h2>
        </VCard>
        <VCard
          hover
          link
          to="/initialize/create"
          width="300"
          class="v-initialize-page__cards-card pa-4 d-flex flex-column align-center justify-center"
        >
          <VIcon class="mb-4" size="40">mdi-plus</VIcon>
          <h2>Add</h2>
        </VCard>
        <VCard
          hover
          link
          to="/initialize/restore"
          width="300"
          class="v-initialize-page__cards-card pa-4 d-flex flex-column align-center justify-center"
        >
          <VIcon class="mb-4" size="40">mdi-restore</VIcon>
          <h2>Restore</h2>
        </VCard>
      </div>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";

@Component({
  components: { Inner },
})
export default class InitializePage extends Vue {}
</script>


<style lang="sass" scoped>
.v-initialize-page
  &__cards
    display: flex
    flex-direction: column
    &-card
      &:not(:last-child)
        margin-bottom: 16px
    @media screen and (min-width: 400px)
      flex-direction: row
      justify-content: center
      &-card
        &:not(:last-child)
          margin-bottom: 0
          margin-right: 16px
</style>
