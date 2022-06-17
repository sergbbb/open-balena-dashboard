<template>
  <div class="sidemenu">
    <nuxt-link :to="{ path: '/application/' + appName}" class="btn btn-lg btn-light d-block mb-3">
      <div class="oi oi-calculator text-big"></div>
      <div class="small">&nbsp;</div>
      <div class="text-big">DEVICES</div>
    </nuxt-link>
    <nuxt-link :to="{ path: '/application/' + appName + '/config_vars'}" class="btn btn-lg btn-light d-block mb-3">
      <div class="oi oi-wrench text-big"></div>
      <div class="text-big">FLEET</div>
      <div class="small">CONFIGURATION</div>
    </nuxt-link>
    <!--        <nuxt-link :to="{ path: '/application/' + appName + '/env_vars'}" class="btn btn-lg btn-light d-block mb-3">
                <div class="text-big">E<span class="small">(x)</span></div>
                <div class="small">ENVIRONMENT</div>
                <div class="text-big">VARIABLES</div>
            </nuxt-link>-->
    <nuxt-link :to="{ path: '/application/' + appName + '/service_vars'}" class="btn btn-lg btn-light d-block mb-3">
      <div class="text-big">S<span class="small">(x)</span></div>
      <div class="text-big">SERVICE</div>
      <div class="small">VARIABLES</div>
    </nuxt-link>
    <nuxt-link :to="{ path: '/application/' + appName + '/releases'}" class="btn btn-lg btn-light d-block mb-3">
      <div class="oi oi-hard-drive text-big"></div>
      <div class="small">&nbsp;</div>
      <div class="text-big">RELEASES</div>
    </nuxt-link>
    <nuxt-link :to="{ path: '/application/' + appName + '/location'}" class="btn btn-lg btn-light d-block mb-3">
      <div class="oi oi-location text-big"></div>
      <div class="small">&nbsp;</div>
      <div class="text-big">LOCATION</div>
    </nuxt-link>
    <nuxt-link :to="{ path: '/application/' + appName + '/actions'}" class="btn btn-lg btn-light d-block mb-3">
      <div class="oi oi-ellipses text-big"></div>
      <div class="small">&nbsp;</div>
      <div class="text-big">ACTIONS</div>
    </nuxt-link>
  </div>
</template>

<script>
  export default {
    props: ['appName']
  }
</script>

<style>
  .sidemenu .nuxt-link-exact-active {
    background: #484848;
    color: #fff;
  }

  @media (max-width: 1024px) {
    .sidemenu {
      display: flex;
      justify-content: space-between;
    }

    .sidemenu .btn {

    }

  }

  @media (max-width: 420px) {
    .sidemenu {
      font-size: 14px !important;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

      .text-big {
        font-size: 14px !important;
      }


    .sidemenu .btn {

    }

  }

</style>
