<template>
    <div class="sidemenu">
        <nuxt-link :to="{ path: '/device/' + uuid }" class="btn btn-lg btn-light d-block mb-3">
            <div class="oi oi-grid-two-up text-big"></div>
            <div class="small">&nbsp;</div>
            <div class="text-big">SUMMARY</div>
        </nuxt-link>
        <nuxt-link :to="{ path: '/device/' + uuid + '/config_vars'}" class="btn btn-lg btn-light d-block mb-3">
            <div class="oi oi-wrench text-big"></div>
            <div class="text-big">DEVICE</div>
            <div class="small">CONFIGURATION</div>
        </nuxt-link>
<!--        <nuxt-link :to="{ path: '/device/' + uuid + '/env_vars'}" class="btn btn-lg btn-light d-block mb-3">
            <div class="text-big">E<span class="small">(x)</span></div>
            <div class="text-big">DEVICE</div>
            <div class="small">VARIABLES</div>
        </nuxt-link>-->
        <nuxt-link :to="{ path: '/device/' + uuid + '/service_vars'}" class="btn btn-lg btn-light d-block mb-3">
            <div class="text-big">S<span class="small">(x)</span></div>
            <div class="small">DEVICE SERVICE</div>
            <div class="text-big">VARIABLES</div>
        </nuxt-link>
        <nuxt-link :to="{ path: '/device/' + uuid + '/location'}" class="btn btn-lg btn-light d-block mb-3">
            <div class="oi oi-location text-big"></div>
            <div class="small">&nbsp;</div>
            <div class="text-big">LOCATION</div>
        </nuxt-link>
        <nuxt-link :to="{ path: '/device/' + uuid + '/actions'}" class="btn btn-lg btn-light d-block mb-3">
            <div class="oi oi-ellipses text-big"></div>
            <div class="small">&nbsp;</div>
            <div class="text-big">ACTIONS</div>
        </nuxt-link>
    </div>
</template>

<script>
    export default {
        props: ['uuid']
    }
</script>

<style>
 .sidemenu .nuxt-link-exact-active {
     background: #484848;
     color: #fff;
 }
</style>
