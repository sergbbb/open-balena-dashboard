<template>
  <div>
    <nuxt />
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

  html {
    font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    word-spacing: 1px;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
  }

  #__nuxt {
    height: 100%;
  }

  @media (min-width: 1400px) {
    .container {
      max-width: 1340px;
    }
  }


</style>
