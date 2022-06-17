<template>
  <div class="authentication-wrapper authentication-1 px-4">
    <div class="authentication-inner py-5">
        <nuxt />
    </div>
    <Notify></Notify>
  </div>
</template>

<script>
    import Nuxt from "../.nuxt/components/nuxt";
    import Notify from '~/components/Notify.vue';
    export default {
        components: {
            Nuxt,
            Notify
        }
    }
</script>

<style>

</style>
