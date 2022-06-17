<template>
  <div class="layout-wrapper layout-1 layout-without-sidenav">
    <div class="layout-inner">
      <div class="layout-navbar">

      </div>
      <div class="layout-container">
        <div class="layout-content">
          <div class="sidenav-horizontal">

          </div>
          <div class="container-fluid flex-grow-1 container-p-y">
            <nuxt />
          </div>
          <div class="footer">

          </div>
        </div>
      </div>
    </div>
    <Notify></Notify>
  </div>
</template>

<script>
    import Nuxt from "../.nuxt/components/nuxt";
    import Notify from '~/components/Notify.vue';

    export default {
      head: {
        script: [
          {src: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.4/socket.io.js'},
        ],
      },
      middleware: 'auth',
      components: {
          Nuxt,
          Notify
      }, created() {
        if (this.$store.state.jwt) {
          this.$axios.defaults.headers.common['Authorization'] = this.$store.state.jwt;
        }
      }
    }
</script>

<style>

</style>
