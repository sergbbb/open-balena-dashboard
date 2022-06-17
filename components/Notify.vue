<template>
    <notifications></notifications>
</template>

<script>
    import Vue from 'vue';
    import Notify from 'vue-notifyjs';
    Vue.use(Notify);

    export default {
        methods: {
            addNotification() {
                this.$notify({
                    message: 'Welcome',
                    type: 'success'
                })
            }
        }
    }
</script>
<!-- import styles -->
<style src="vue-notifyjs/themes/default.css"></style>
<style src="vue-notifyjs/themes/material.css"></style>
